const express = require("express")
const stripe = require("../external/stripeClient")
const router = express.Router()

router.post("/create-checkout-session", async (req, res) => {
  try {
    console.log('🔍 Stripe Secret Key exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));

    const { 
      items, 
      shippingFee = 0, 
      totalAmount, 
      deliveryAddress = null,
      successUrl,
      cancelUrl,
      savedCard = null 
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "Cart is empty",
      })
    }

<<<<<<< HEAD
    // Get base URL from environment or request
    // Priority: FRONTEND_URL > origin header > referer header
    let baseUrl = process.env.FRONTEND_URL;
    
    if (!baseUrl) {
      const origin = req.headers.origin;
      const referer = req.headers.referer;
      
      if (origin) {
        baseUrl = origin;
      } else if (referer) {
        // Extract base URL from referer
        try {
          const url = new URL(referer);
          baseUrl = `${url.protocol}//${url.host}`;
        } catch (e) {
          baseUrl = referer.split('/').slice(0, 3).join('/');
        }
      } else {
        // Fallback for development
        baseUrl = `${req.protocol}://${req.get('host')}`;
      }
    }
    
    console.log('🔍 Base URL:', baseUrl);
    
    // Calculate items total
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate grand total (items + shipping)
    const grandTotal = totalAmount || (itemsTotal + (shippingFee || 0));
    
    // Convert cart items to Stripe line items
    const lineItems = items.map((item) => {
      // Build description with additional details
      let description = item.description || "";
      if (item.size) {
        description += description ? ` • Size: ${item.size}` : `Size: ${item.size}`;
      }
      if (item.shopName || item.stallName) {
        const shopName = item.shopName || item.stallName;
        description += description ? ` • From: ${shopName}` : `From: ${shopName}`;
      }

      return {
        price_data: {
          currency: "sgd",
          product_data: {
            name: item.name || item.item_name || 'Food Item',
            description: description || "",
            images: item.image || item.img_url ? [item.image || item.img_url] : undefined,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity || item.qty || 1,
      }
    })

    // Build base URL
    const baseUrl = req.headers.origin || "http://localhost:10000";
    
    // Calculate total for description
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create Checkout Session using Stripe API
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/pages/order/orderconfirmed.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pages/order/checkout.html`,
      metadata: {
        orderId: `order_${Date.now()}`,
        items: JSON.stringify(items),
        total: total.toFixed(2),
      },
    })

    console.log("✅ Checkout Session Created:", {
      id: session.id,
      url: session.url,
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error("❌ Error creating checkout session:", error)
    res.status(500).json({
      error: "Failed to create checkout session",
      details: error.message,
    })
  }
})

// Endpoint to verify Stripe checkout session
router.get("/verify-checkout-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return res.status(400).json({
        error: "Invalid session ID",
      })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    })

    // Check if payment was successful
    if (session.payment_status === "paid") {
      // Retrieve payment intent details
      let paymentIntent = null
      if (session.payment_intent) {
        if (typeof session.payment_intent === "string") {
          paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
        } else {
          paymentIntent = session.payment_intent
        }
      }

      // Return session and payment details
      res.json({
        success: true,
        session: {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_email,
          metadata: session.metadata,
        },
        payment: paymentIntent
          ? {
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
            }
          : null,
      })
    } else {
      res.json({
        success: false,
        session: {
          id: session.id,
          payment_status: session.payment_status,
        },
        message: "Payment not completed",
      })
    }
  } catch (error) {
    console.error("❌ Error verifying checkout session:", error)
    res.status(500).json({
      error: "Failed to verify checkout session",
      details: error.message,
    })
  }
})

<<<<<<< HEAD
// Endpoint to create a Stripe Payment Link dynamically
router.post("/create-payment-link", async (req, res) => {
  try {
    const { 
      items, 
      shippingFee = 0, 
      totalAmount, 
      successUrl,
      orderId,
      stallName,
      foodCentre,
      pickupOption,
      pickupTime
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "Cart is empty",
      })
    }

    // Get base URL from environment or request
    // Priority: FRONTEND_URL > origin header > referer header
    let baseUrl = process.env.FRONTEND_URL;
    
    if (!baseUrl) {
      const origin = req.headers.origin;
      const referer = req.headers.referer;
      
      if (origin) {
        baseUrl = origin;
      } else if (referer) {
        // Extract base URL from referer
        try {
          const url = new URL(referer);
          baseUrl = `${url.protocol}//${url.host}`;
        } catch (e) {
          baseUrl = referer.split('/').slice(0, 3).join('/');
        }
      } else {
        // Fallback for development
        baseUrl = `${req.protocol}://${req.get('host')}`;
      }
    }
    
    console.log('🔍 Base URL:', baseUrl);
    console.log('🔍 Creating Payment Link for order:', orderId);
    
    // Calculate items total
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate grand total (items + shipping)
    const grandTotal = totalAmount || (itemsTotal + (shippingFee || 0));
    
    // Convert cart items to Stripe line items using price_data
    const lineItems = items.map((item) => {
      // Build description with additional details
      let description = item.description || "";
      if (item.size) {
        description += description ? ` • Size: ${item.size}` : `Size: ${item.size}`;
      }
      if (item.shopName || item.stallName) {
        const shopName = item.shopName || item.stallName;
        description += description ? ` • From: ${shopName}` : `From: ${shopName}`;
      }

      return {
        price_data: {
          currency: "sgd",
          product_data: {
            name: item.name || item.item_name || 'Food Item',
            description: description || "",
            images: item.image || item.img_url ? [item.image || item.img_url] : undefined,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity || item.qty || 1,
      }
    })

    // Add shipping as a separate line item if applicable
    if (shippingFee && shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: "sgd",
          product_data: {
            name: "Shipping Fee",
            description: "Delivery or service fee",
          },
          unit_amount: Math.round(shippingFee * 100),
        },
        quantity: 1,
      })
    }
    
    // Prepare metadata
    const metadata = {
      orderId: orderId || `order_${Date.now()}`,
      items: JSON.stringify(items),
      itemsTotal: itemsTotal.toFixed(2),
      shippingFee: (shippingFee || 0).toFixed(2),
      total: grandTotal.toFixed(2),
    }

    // Add stall/shop info to metadata if available
    if (stallName) {
      metadata.stallName = stallName;
    }
    if (foodCentre) {
      metadata.foodCentre = foodCentre;
    }
    if (pickupOption) {
      metadata.pickupOption = pickupOption;
    }
    if (pickupTime) {
      metadata.pickupTime = pickupTime;
    }
    
    // Create Payment Link using Stripe API
    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
      metadata: metadata,
      // Configure redirect after completion
      after_completion: {
        type: 'redirect',
        redirect: {
          url: successUrl || `${baseUrl}/pages/order/orderconfirmed.html`,
        },
      },
      // Allow promotion codes
      allow_promotion_codes: true,
    })

    console.log("✅ Payment Link Created:", {
      id: paymentLink.id,
      url: paymentLink.url,
      total: grandTotal,
      itemsCount: items.length,
      orderId: orderId
    })

    res.json({ 
      url: paymentLink.url,
      paymentLinkId: paymentLink.id 
    })
  } catch (error) {
    console.error("❌ Error creating payment link:", error)
    console.error("❌ Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    })
    res.status(500).json({
      error: "Failed to create payment link",
      details: error.message,
    })
  }
})

// Create Payment Intent endpoint (for direct Stripe integration)
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "sgd", order } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Amount must be greater than 0."
      });
    }

    console.log("💳 Creating Payment Intent:", {
      amount: amount,
      currency: currency,
      orderId: order?.id
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId: order?.id || `order_${Date.now()}`,
        customerEmail: order?.customer?.email || "unknown",
        foodCentre: order?.info?.foodCentre || "unknown",
        stall: order?.info?.stall || "unknown"
      },
      description: `Food order from ${order?.info?.stall || "Unknown Stall"}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("✅ Payment Intent Created:", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error("❌ Error creating payment intent:", error);
    res.status(500).json({
      error: "Failed to create payment intent",
      details: error.message
    });
  }
});

module.exports = router
