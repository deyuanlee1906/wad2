// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Initialize Stripe with your secret key
const stripe = require("stripe")(functions.config().stripe.secret_key);

admin.initializeApp();

// Create Stripe Checkout Session
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({error: "Method not allowed"});
    }

    try {
      const {
        items,
        orderId,
        stallName,
        foodCentre,
        pickupOption,
        pickupTime,
        successUrl,
        cancelUrl,
      } = req.body;

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({error: "Items array is required"});
      }

      // Prepare line items for Stripe
      const lineItems = items.map((item) => ({
        price_data: {
          currency: "sgd", // Singapore Dollar
          product_data: {
            name: item.name,
            description: item.description || `From ${stallName}`,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity || 1,
      }));

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "paynow", "grabpay"], // Singapore payment methods
        line_items: lineItems,
        mode: "payment",
        success_url: successUrl ||
          `${req.headers.origin}/pages/order/orderconfirmed.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.origin}/pages/order/checkout.html`,
        metadata: {
          orderId: orderId || "",
          stallName: stallName || "",
          foodCentre: foodCentre || "",
          pickupOption: pickupOption || "",
          pickupTime: pickupTime || "",
          items: JSON.stringify(items),
        },
        customer_email: req.body.customerEmail || undefined,
      });

      console.log("✅ Checkout session created:", session.id);

      return res.status(200).json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error("❌ Error creating checkout session:", error);
      return res.status(500).json({
        error: "Failed to create checkout session",
        details: error.message,
      });
    }
  });
});

// Verify Checkout Session (called from orderconfirmed.html)
exports.verifyCheckoutSession = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    // Only allow GET requests
    if (req.method !== "GET") {
      return res.status(405).json({error: "Method not allowed"});
    }

    try {
      const sessionId = req.query.session_id || req.params.sessionId;

      if (!sessionId) {
        return res.status(400).json({error: "Session ID is required"});
      }

      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent", "line_items"],
      });

      console.log("✅ Session verified:", session.id);

      return res.status(200).json({
        success: true,
        session: {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_details ? session.customer_details.email : null,
          metadata: session.metadata,
        },
        payment: session.payment_intent ? {
          id: session.payment_intent.id,
          status: session.payment_intent.status,
        } : null,
      });
    } catch (error) {
      console.error("❌ Error verifying session:", error);
      return res.status(500).json({
        error: "Failed to verify session",
        details: error.message,
      });
    }
  });
});

// Stripe Webhook Handler (for real-time payment notifications)
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("💰 Payment successful:", session.id);

      // Save order to Firestore
      try {
        const orderData = {
          orderId: session.metadata.orderId,
          sessionId: session.id,
          paymentIntentId: session.payment_intent,
          amount: session.amount_total / 100,
          currency: session.currency,
          status: "paid",
          paymentStatus: session.payment_status,
          customerEmail: session.customer_details?.email,
          stallName: session.metadata.stallName,
          foodCentre: session.metadata.foodCentre,
          pickupOption: session.metadata.pickupOption,
          pickupTime: session.metadata.pickupTime,
          items: JSON.parse(session.metadata.items),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await admin.firestore().collection("orders").doc(session.metadata.orderId).set(orderData);
        console.log("✅ Order saved to Firestore:", session.metadata.orderId);
      } catch (error) {
        console.error("❌ Error saving order to Firestore:", error);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.log("❌ Payment failed:", paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});
