# 💳 Complete Stripe Payment Integration Guide

## ✅ Your Stripe Payment is Already Set Up!

Your project already has Stripe integration configured. Here's what you need to do:

---

## 📋 **What You Have:**

### ✅ **Files Already Created:**
1. **`src/pages/order/payment.html`** - Payment page with Stripe integration
2. **`server/routes/payments.js`** - Backend payment API
3. **`server/external/stripeClient.js`** - Stripe client configuration
4. **`server/index.js`** - Express server setup

### ✅ **Stripe API Keys:**
- **Publishable Key (Frontend):** `pk_test_51SIrnNLffQP02jW1smvV9ZhxCqSBmrGrAggs1EPHGVqKK6pqy0Ou6IqvEPzPLOGZePWmxQZCpfBt030duTdKvBUD00rPG3tKOL`
- **Secret Key (Backend):** `sk_test_51SIrnNLffQP02jW1V41F9l5emSSV1VGmEr1cIUbOUn0PmjcfPGBWKAZbujNpunhaJyLPKGS77wXkiLb3kjdOcFJu00IREvpkbz`

---

## 🚀 **How to Use Stripe API:**

### **Step 1: Create `.env` File**

Create a file called `.env` in the root of your project:

```bash
# In /Applications/MAMP/htdocs/wad2/.env
PORT=3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51SIrnNLffQP02jW1V41F9l5emSSV1VGmEr1cIUbOUn0PmjcfPGBWKAZbujNpunhaJyLPKGS77wXkiLb3kjdOcFJu00IREvpkbz
STRIPE_PUBLISHABLE_KEY=pk_test_51SIrnNLffQP02jW1smvV9ZhxCqSBmrGrAggs1EPHGVqKK6pqy0Ou6IqvEPzPLOGZePWmxQZCpfBt030duTdKvBUD00rPG3tKOL
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **Step 2: Install Dependencies**

```bash
cd /Applications/MAMP/htdocs/wad2
npm install
```

### **Step 3: Start the Server**

```bash
npm run server
```

You should see:
```
🚀 Server running on port 3000
📱 Frontend available at http://localhost:3000
💳 Payment API available at http://localhost:3000/api/payments
```

### **Step 4: Test Your Payment**

1. **Open your app:** `http://localhost:3000`
2. **Navigate to payment page**
3. **Use test card:** `4242 4242 4242 4242`
4. **Fill in details:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
5. **Click "Complete Payment"**

---

## 🔍 **How It Works:**

### **Payment Flow:**

1. **User clicks "Pay"** in checkout
2. **Frontend calls:** `POST /api/create-payment-intent`
3. **Backend creates Payment Intent** using Stripe
4. **Frontend receives `clientSecret`** from backend
5. **Stripe Elements** collect card details
6. **Payment is confirmed** using Stripe API
7. **Success!** Redirect to confirmation page

### **What Happens Behind the Scenes:**

```javascript
// 1. Frontend sends payment data to backend
fetch('/api/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({ amount: 15.00, currency: 'sgd' })
})

// 2. Backend creates payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1500, // in cents
  currency: 'sgd'
});

// 3. Frontend confirms payment
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  { payment_method: { card: cardElement } }
);

// 4. Success! Payment processed
```

---

## 🧪 **Test Cards:**

Stripe provides test cards for testing:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`
- **Insufficient Funds:** `4000 0000 0000 9995`

---

## 📊 **View Transactions:**

### **In Stripe Dashboard:**
1. Go to https://dashboard.stripe.com/
2. Click **Payments** in left menu
3. See all transactions
4. Click any payment for details

### **In Your App:**
- All payments are logged in server console
- Success messages show payment ID
- Transactions appear in Stripe dashboard immediately

---

## 🔧 **API Endpoints:**

Your backend exposes these endpoints:

### **1. Create Payment Intent**
```bash
POST /api/create-payment-intent

Request:
{
  "amount": 15.00,
  "currency": "sgd",
  "order": { ... }
}

Response:
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### **2. Confirm Payment**
```bash
POST /api/confirm-payment

Request:
{
  "paymentIntentId": "pi_xxx"
}

Response:
{
  "status": "succeeded",
  "paymentIntent": { ... }
}
```

### **3. Get Payment Details**
```bash
GET /api/payment-intent/:id

Response:
{
  "id": "pi_xxx",
  "amount": 1500,
  "status": "succeeded",
  "metadata": { ... }
}
```

---

## ⚠️ **Important Notes:**

### **For Test Mode:**
- ✅ Safe to use test keys
- ✅ No real money charged
- ✅ Test cards work
- ✅ All transactions visible in dashboard

### **For Live Mode:**
- ⚠️ Switch to live keys from Stripe dashboard
- ⚠️ Will charge real money
- ⚠️ Need to configure webhooks
- ⚠️ Need to set up bank account for payouts

---

## 🎯 **Quick Start:**

1. **Create `.env` file** (see above)
2. **Run:** `npm install`
3. **Start server:** `npm run server`
4. **Test payment** with test card
5. **Check Stripe dashboard** for transactions

---

## 🔍 **Troubleshooting:**

### **Error: "Failed to create payment intent"**
- Check if `.env` file exists
- Verify `STRIPE_SECRET_KEY` is set
- Make sure server is running

### **Error: "Cannot connect to server"**
- Run `npm run server`
- Check if port 3000 is available
- Check server console for errors

### **Payment succeeds but nothing happens**
- Check browser console for errors
- Verify redirect logic in payment.js
- Check server logs for errors

---

## 📝 **Next Steps:**

1. ✅ Configure `.env` file
2. ✅ Start the server
3. ✅ Test payment flow
4. ✅ View transactions in Stripe dashboard
5. ✅ Set up webhooks (optional)
6. ✅ Switch to live mode (when ready)

---

Your Stripe integration is ready to use! Just set up the `.env` file and start the server! 🎉
