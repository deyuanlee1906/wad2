const express = require("express")
const stripe = require("../external/stripeClient")
const router = express.Router()

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "Cart is empty",
      })
    }

    // Convert cart items to Stripe line items with stall name in description
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "sgd",
        product_data: {
          name: item.name,
          description: item.description || "",
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

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
    console.error("❌ Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    })
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

module.exports = router
