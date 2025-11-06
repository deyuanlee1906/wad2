# Stripe Webhook Testing Guide

This guide helps you test Stripe webhooks locally before deploying to Render.

---

## 🎯 Quick Method: Stripe CLI (Recommended)

The easiest way to test webhooks locally is using the Stripe CLI to forward events to your local server.

### Step 1: Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
# Or use Chocolatey:
choco install stripe-cli
```

**Linux:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
# Or use snap:
snap install stripe
```

### Step 2: Login to Stripe

```bash
stripe login
```

This will open your browser to authenticate with Stripe.

### Step 3: Forward Webhooks to Local Server

Start your local server:
```bash
npm run server
# Server should be running on http://localhost:3000
```

In a new terminal, forward Stripe events:
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

The CLI will output a webhook signing secret:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Set Local Webhook Secret

Copy the `whsec_...` value and add it to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

Restart your server to load the new environment variable.

### Step 5: Trigger Test Events

In another terminal, trigger test events:
```bash
# Test payment succeeded
stripe trigger payment_intent.succeeded

# Test payment failed
stripe trigger payment_intent.payment_failed
```

You should see the events in:
- Your server console (logs)
- The Stripe CLI output
- Your application logic (if handling events)

---

## 🔍 Method 2: Using ngrok (For Production-like Testing)

If you want to test with actual Stripe dashboard webhooks pointing to your local server:

### Step 1: Install ngrok

```bash
# macOS
brew install ngrok

# Or download from: https://ngrok.com/download
```

### Step 2: Start Local Server

```bash
npm run server
```

### Step 3: Create ngrok Tunnel

```bash
ngrok http 3000
```

This will give you a public URL like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

### Step 4: Add Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL**: `https://abc123.ngrok.io/api/webhook`
4. **Events**: Select `payment_intent.succeeded` and `payment_intent.payment_failed`
5. Click "Add endpoint"

### Step 5: Copy Webhook Secret

After creating, copy the "Signing secret" (starts with `whsec_`) and add to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_secret_from_stripe
```

### Step 6: Test with Stripe Dashboard

1. Go to Stripe Dashboard → Payments
2. Create a test payment
3. Check your server logs for webhook events
4. Or use Stripe Dashboard → Webhooks → Your endpoint → "Send test webhook"

---

## 🧪 Method 3: Manual Testing with cURL

You can manually send test webhook events using cURL:

### Step 1: Get Webhook Secret

Use the Stripe CLI to get a signing secret:
```bash
stripe listen --print-secret
```

### Step 2: Create Test Payload

Save this as `test_webhook.json`:
```json
{
  "id": "evt_test_webhook",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_test_123",
      "object": "payment_intent",
      "amount": 2000,
      "currency": "sgd",
      "status": "succeeded",
      "metadata": {
        "orderId": "test_order_123"
      }
    }
  }
}
```

### Step 3: Sign the Payload

Use Stripe CLI to sign:
```bash
stripe listen --print-secret | xargs -I {} stripe webhooks construct-event test_webhook.json {} --print
```

### Step 4: Send to Server

Use the signed payload in a cURL request to your local server.

---

## 📝 Testing Checklist

Test these scenarios:

- [ ] **Payment Succeeded**: Create successful payment → Verify webhook received
- [ ] **Payment Failed**: Create failed payment → Verify webhook received
- [ ] **Webhook Signature**: Verify signature validation works
- [ ] **Error Handling**: Test invalid signature → Should return 400
- [ ] **Server Logs**: Check that webhook events are logged correctly
- [ ] **Database Updates**: If you store webhook data, verify it's saved
- [ ] **Idempotency**: Test sending same event twice

---

## 🐛 Common Issues

### Issue: "Webhook signature verification failed"

**Cause:** `STRIPE_WEBHOOK_SECRET` doesn't match the one used to sign the webhook.

**Solution:**
- Use the secret from `stripe listen` for local testing
- Use the secret from Stripe Dashboard for production webhooks
- Ensure secret is correctly set in `.env` file

### Issue: "Webhook not received"

**Solution:**
- Check server is running on correct port
- Verify webhook URL is correct (`/api/webhook`)
- Check firewall/network settings
- For ngrok: Verify tunnel is active

### Issue: "Event type not handled"

**Solution:**
- Check `server/routes/payments.js` webhook handler
- Add logging to see what event types are received
- Handle additional event types if needed

### Issue: "Request body parsing error"

**Solution:**
- Verify webhook route uses `express.raw({type: 'application/json'})`
- Stripe sends raw JSON, not parsed JSON
- Check middleware order in Express app

---

## 🔍 Debugging Tips

### 1. Enable Detailed Logging

Add logging to your webhook handler:
```javascript
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  console.log('Webhook received:', {
    headers: req.headers,
    bodyLength: req.body.length,
    signature: req.headers['stripe-signature']
  });
  // ... rest of handler
});
```

### 2. Test Webhook Endpoint

Create a test endpoint to verify webhook route works:
```javascript
router.post('/webhook-test', (req, res) => {
  console.log('Test webhook received:', req.body);
  res.json({ received: true });
});
```

### 3. Check Stripe Dashboard

- Go to Webhooks → Your endpoint
- View event logs
- See request/response details
- Resend events if needed

---

## 🚀 Production Testing

After deploying to Render:

1. **Update Stripe Webhook URL:**
   - Change endpoint to: `https://your-app.onrender.com/api/webhook`

2. **Update Webhook Secret:**
   - Copy new secret from Stripe Dashboard
   - Update `STRIPE_WEBHOOK_SECRET` in Render environment variables

3. **Test Production Webhook:**
   - Create a test payment
   - Check Render logs for webhook events
   - Verify events are processed correctly

---

## 📚 Additional Resources

- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks Guide](https://stripe.com/docs/webhooks/test)

---

**Pro Tip:** Always test webhooks locally first before deploying to production!

