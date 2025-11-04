# 🔒 Stripe Sandbox Setup Guide

## 📋 Overview

This guide will help you set up Stripe in **sandbox/test mode** for dynamic checkout sessions. The implementation uses **Stripe Checkout Sessions API** to create payment sessions with amounts calculated automatically from your cart items.

---

## 🔑 Step 1: Get Your Stripe API Keys

### 1.1 Create/Login to Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Create an account (or login if you have one)
3. Complete the onboarding process

### 1.2 Get Test API Keys

1. Make sure you're in **Test Mode** (toggle in top right of dashboard)
2. Go to **Developers** → **API keys** in the left sidebar
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`) - Safe to expose (not used in current implementation)
   - **Secret key** (starts with `sk_test_...`) - ⚠️ NEVER expose this!

4. Click **"Reveal test key"** to see your secret key
5. Copy the secret key (you'll need this)

**Note:** The current implementation uses Stripe Checkout Sessions, which only requires the secret key on the backend. The frontend doesn't need the publishable key.

---

## 📁 Step 2: Set Up Environment Variables

### 2.1 Create `.env` File

1. In your project root (`/Applications/MAMP/htdocs/wad2/`), create a file called `.env`
2. If you have `.env.example`, copy it:

```bash
cp .env.example .env
```

### 2.2 Add Your Stripe Secret Key

Open `.env` and add your secret key:

```env
# Server Configuration
PORT=10000

# Stripe Configuration (Test/Sandbox Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
```

⚠️ **Important:** Replace `YOUR_ACTUAL_SECRET_KEY_HERE` with your actual secret key from Stripe dashboard.

**Note:** `STRIPE_WEBHOOK_SECRET` is optional and only needed if you want to handle webhook events.

### 2.3 Verify `.env` is in `.gitignore`

The `.env` file should already be in `.gitignore` (it is). This prevents committing your keys to Git.

---

## 🔧 Step 3: Install Dependencies

```bash
cd /Applications/MAMP/htdocs/wad2
npm install
```

This installs:
- `stripe` - Stripe Node.js SDK (for Checkout Sessions API)
- `dotenv` - For loading environment variables
- `express` - Backend server framework
- `cors` - CORS middleware

---

## 🚀 Step 4: Start Your Server

### 4.1 For Local Testing

```bash
npm run server
```

You should see:
```
🚀 Server running on port 10000
📱 Frontend available at http://localhost:10000
💳 Payment API available at http://localhost:10000/api
```

### 4.2 For Live Deployment (Render/Your Hosting Platform)

Add environment variables in your hosting platform:

#### Option A: Render Dashboard
1. Go to your Render Dashboard
2. Click your service (e.g., "chope-lah")
3. Go to **Environment** tab
4. Add this variable:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

5. Click **Save Changes**
6. Render will automatically redeploy

#### Option B: render.yaml (Already Updated)
Your `render.yaml` already includes this. Just make sure to add the value in Render Dashboard (it's set to `sync: false`).

**After adding the variable, your live app at `https://your-app.onrender.com` will work with Stripe!**

---

## 🧪 Step 5: Test the Integration

### 5.1 Test Cards

Stripe provides test cards for sandbox mode:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0025 0000 3155` | 🔐 Requires authentication |
| `4000 0000 0000 9995` | 💰 Insufficient funds |

**Use any:**
- Expiry date: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

### 5.2 Test Payment Flow

**For Local Testing:**
1. Make sure your server is running: `npm run server`
2. Open http://localhost:10000
3. Navigate to checkout page (add items to cart first)
4. Select "Credit/Debit Card" payment method
5. Click "Complete Payment"
6. You'll be redirected to Stripe Checkout with your cart items and total
7. Enter test card: `4242 4242 4242 4242`
8. Complete payment
9. You'll be redirected back to the success page

**For Live/Production:**
1. Open your live app URL (e.g., `https://your-app.onrender.com`)
2. Navigate to checkout page (add items to cart first)
3. Select "Credit/Debit Card" payment method
4. Click "Complete Payment"
5. You'll be redirected to Stripe Checkout with your cart items and total
6. Enter test card: `4242 4242 4242 4242`
7. Complete payment
8. You'll be redirected back to the success page

✅ **The amount is automatically calculated from your cart items - no manual entry needed!**

---

## 📊 Step 6: View Transactions in Stripe Dashboard

### 6.1 View All Payments

1. Go to https://dashboard.stripe.com/test/payments
2. You'll see all test transactions
3. Click any payment to see details

### 6.2 View Checkout Sessions

1. Go to **Payments** → **Checkout sessions**
2. See all created checkout sessions
3. Click any session to see details (items, amount, status)

### 6.3 View Events

1. Go to **Developers** → **Events**
2. See webhook events (if configured)
3. Filter by event type (e.g., `checkout.session.completed`)

---

## 🔍 How It Works (Current Implementation)

### ✅ What We're Using:

1. **Stripe Checkout Sessions API** - Creates hosted payment pages
2. **Backend API endpoint** (`/api/create-checkout-session`) - Creates checkout sessions server-side
3. **Dynamic amounts** - Calculated automatically from cart items
4. **Secure** - Secret key stays on server, never exposed to client

### 📁 File Structure:

```
wad2/
├── .env                    # Your API keys (NOT in Git)
├── server/
│   ├── index.js            # Express server setup
│   ├── routes/
│   │   └── payments.js     # POST /api/create-checkout-session
│   └── external/
│       └── stripeClient.js # Loads secret key from .env
└── src/
    └── pages/
        └── order/
            └── checkout.html # Calls /api/create-checkout-session
```

### 🔐 Payment Flow:

```
1. User adds items to cart
2. User clicks "Complete Payment" on checkout page
3. Frontend calls: POST /api/create-checkout-session
   - Sends cart items (name, price, quantity)
4. Backend creates Stripe Checkout Session:
   - Converts cart items to Stripe line items
   - Calculates total automatically
   - Creates session with success/cancel URLs
5. Backend returns checkout URL to frontend
6. Frontend redirects user to Stripe Checkout
7. User completes payment on Stripe's hosted page
8. Stripe redirects back to success page
```

### 💡 Key Features:

- ✅ **Dynamic amounts** - Total calculated from cart automatically
- ✅ **Itemized checkout** - Each cart item appears separately in Stripe
- ✅ **No frontend Stripe.js needed** - Just redirect to checkout URL
- ✅ **Secure** - Secret key never leaves the server
- ✅ **PCI compliant** - Stripe handles all card data

---

## 🛠️ Troubleshooting

### ❌ "Server returned an error. Please make sure the server is running"

**Problem:** Server is not running or `.env` file missing/invalid

**Solution:**
1. Make sure server is running: `npm run server`
2. Check if `.env` exists in project root
3. Verify `STRIPE_SECRET_KEY` is set correctly
4. Check server console for errors

### ❌ "Cart is empty"

**Problem:** Cart has no items when trying to checkout

**Solution:**
1. Add items to cart before clicking "Complete Payment"
2. Check browser console for cart data
3. Verify cart is stored in localStorage

### ❌ "Failed to create checkout session"

**Problem:** Secret key incorrect or Stripe API error

**Solution:**
1. Verify `STRIPE_SECRET_KEY` in `.env`
2. Make sure you're using **test keys** (start with `sk_test_`)
3. Check Stripe dashboard for account status
4. Check server console for detailed error messages
5. Verify your Stripe account is active

### ❌ "Unexpected token '<'" or "Non-JSON response"

**Problem:** API endpoint returning HTML (404 or error page) instead of JSON

**Solution:**
1. Make sure server is running on correct port (default: 10000)
2. Verify API endpoint is accessible: `curl http://localhost:10000/api/create-checkout-session`
3. Check server routes are mounted correctly
4. Verify `server/routes/payments.js` is imported in `server/index.js`

### ❌ Server not starting

**Problem:** Port already in use or missing dependencies

**Solution:**
1. Check if port 10000 is already in use
2. Change `PORT` in `.env` if needed
3. Run `npm install` to ensure dependencies are installed
4. Check for syntax errors in server files

---

## 📝 Checklist

### For Local Development:
- [ ] Created Stripe account
- [ ] Got test API secret key from dashboard
- [ ] Created `.env` file
- [ ] Added `STRIPE_SECRET_KEY` to `.env`
- [ ] Installed dependencies (`npm install`)
- [ ] Started server (`npm run server`)
- [ ] Added items to cart
- [ ] Tested payment with test card on localhost
- [ ] Verified redirect to Stripe Checkout
- [ ] Verified redirect back to success page

### For Live/Production:
- [ ] Created Stripe account
- [ ] Got test API secret key from dashboard
- [ ] Added `STRIPE_SECRET_KEY` to hosting environment variables
- [ ] Verified service redeployed after adding variable
- [ ] Added items to cart on live site
- [ ] Tested payment with test card on live URL
- [ ] Verified redirect to Stripe Checkout
- [ ] Verified redirect back to success page
- [ ] Verified transaction in Stripe dashboard

---

## 🎯 Next Steps

1. **Test thoroughly** with different cart combinations
2. **Test with different card scenarios** (declined, insufficient funds, etc.)
3. **Set up webhooks** (optional) to receive payment events server-side
4. **Switch to live mode** when ready (change key to live key: `sk_live_...`)
5. **Never commit `.env`** to Git (already in `.gitignore`)

---

## 🔗 Useful Links

- **Stripe Dashboard:** https://dashboard.stripe.com/test/dashboard
- **Checkout Sessions API:** https://stripe.com/docs/api/checkout/sessions
- **Test Cards:** https://stripe.com/docs/testing
- **API Documentation:** https://stripe.com/docs/api
- **Webhooks Guide:** https://stripe.com/docs/webhooks

---

## 📋 API Endpoint Reference

### POST `/api/create-checkout-session`

Creates a Stripe Checkout Session with cart items.

**Request Body:**
```json
{
  "items": [
    {
      "name": "Food Item Name",
      "price": 10.50,
      "quantity": 2,
      "description": "Optional description"
    }
  ]
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

---

✅ **You're all set!** Your Stripe integration is now secure and ready for sandbox testing with dynamic checkout sessions.
