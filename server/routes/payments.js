const express = require("express")
const stripe = require("../external/stripeClient")
const router = express.Router()

/**
 * Validate cart items
 * @param {Array} items - Cart items to validate
 * @returns {Object} - { valid: boolean, errors: Array }
 */
function validateCartItems(items) {
  const errors = [];
  
  if (!items || !Array.isArray(items)) {
    errors.push('Items must be an array');
    return { valid: false, errors };
  }
  
  if (items.length === 0) {
    errors.push('Cart is empty');
    return { valid: false, errors };
  }
  
  if (items.length > 100) {
    errors.push('Cart cannot contain more than 100 items');
  }
  
  items.forEach((item, index) => {
    if (!item.name || typeof item.name !== 'string') {
      errors.push(`Item ${index + 1}: name is required and must be a string`);
    }
    
    if (typeof item.price !== 'number' || item.price < 0) {
      errors.push(`Item ${index + 1}: price must be a non-negative number`);
    }
    
    if (item.price > 10000) {
      errors.push(`Item ${index + 1}: price exceeds maximum allowed ($10,000)`);
    }
    
    if (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 100) {
      errors.push(`Item ${index + 1}: quantity must be between 1 and 100`);
    }
    
    if (!Number.isInteger(item.quantity)) {
      errors.push(`Item ${index + 1}: quantity must be an integer`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body

    // Validate cart items
    const validation = validateCartItems(items);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Invalid cart data",
        details: validation.errors
      })
    }

    // Convert cart items to Stripe line items with stall name in description
    const lineItems = items.map((item) => {
      const productData = {
        name: item.name,
      };
      
      // Only include description if it's a non-empty string
      if (item.description && item.description.trim() !== "") {
        productData.description = item.description;
      }
      
      return {
        price_data: {
          currency: "sgd",
          product_data: productData,
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
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

module.exports = router