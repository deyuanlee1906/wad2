# 🔥 Firebase Functions + Stripe Setup Guide

## ✅ **What's Been Set Up:**

### **1. Firebase Functions (`functions/index.js`)**
- ✅ `createPaymentIntent` - Creates Stripe payment intent
- ✅ `confirmPayment` - Confirms payment (optional)
- ✅ `health` - Health check endpoint
- ✅ CORS enabled for all functions
- ✅ Stripe integration ready

### **2. Checkout Page (`checkout.html`)**
- ✅ Stripe.js loaded
- ✅ Calls Firebase Functions (not localhost)
- ✅ Uses your Stripe publishable key
- ✅ Handles payment processing

---

## 🚀 **How to Deploy Firebase Functions:**

### **Step 1: Install Dependencies**

```bash
cd /Applications/MAMP/htdocs/wad2/functions
npm install
```

This will install:
- `firebase-functions`
- `firebase-admin`
- `stripe`
- `cors`

### **Step 2: Set Stripe Secret Key (Optional)**

You can set the Stripe secret key in two ways:

#### **Option A: Environment Variable (Recommended)**
```bash
# Set in Firebase Console
firebase functions:config:set stripe.secret_key="sk_test_..."
```

#### **Option B: Hardcoded (Already in code)**
The secret key is already in `functions/index.js` as a fallback.

### **Step 3: Deploy Functions**

```bash
# From project root
cd /Applications/MAMP/htdocs/wad2
firebase deploy --only functions
```

### **Step 4: Get Your Functions URL**

After deployment, Firebase will show you the URLs:
```
✔ functions[createPaymentIntent(us-central1)] Successful create operation.
Function URL: https://us-central1-wad2-login-5799b.cloudfunctions.net/createPaymentIntent
```

**Update `checkout.html` with your actual URL if different!**

---

## 📋 **Functions Endpoints:**

### **1. Create Payment Intent**
```
POST https://us-central1-wad2-login-5799b.cloudfunctions.net/createPaymentIntent

Body:
{
  "amount": 15.50,
  "currency": "sgd",
  "order": {
    "id": "order_123",
    "items": [...],
    "info": {
      "foodCentre": "Maxwell Food Centre",
      "stall": "Peanuts Soup"
    }
  }
}

Response:
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### **2. Confirm Payment**
```
POST https://us-central1-wad2-login-5799b.cloudfunctions.net/confirmPayment

Body:
{
  "paymentIntentId": "pi_xxx"
}

Response:
{
  "status": "succeeded",
  "paymentIntent": {...}
}
```

### **3. Health Check**
```
GET https://us-central1-wad2-login-5799b.cloudfunctions.net/health

Response:
{
  "status": "OK",
  "message": "Firebase Functions are running",
  "timestamp": "2024-..."
}
```

---

## 🔧 **Update Checkout.html Function URL:**

If your Firebase Functions are in a different region, update this in `checkout.html`:

```javascript
function getFirebaseFunctionsUrl() {
  const projectId = 'wad2-login-5799b';
  const region = 'us-central1'; // Change if different
  return `https://${region}-${projectId}.cloudfunctions.net`;
}
```

**Common regions:**
- `us-central1` (default)
- `us-east1`
- `asia-southeast1` (Singapore)
- `europe-west1`

---

## 🧪 **Test the Integration:**

### **1. Deploy Functions**
```bash
firebase deploy --only functions
```

### **2. Test Health Endpoint**
Open in browser:
```
https://us-central1-wad2-login-5799b.cloudfunctions.net/health
```

Should return:
```json
{"status":"OK","message":"Firebase Functions are running",...}
```

### **3. Test Payment Flow**
1. Go to checkout page
2. Select "Credit/Debit Card"
3. Click "Complete Payment"
4. Should create payment intent via Firebase Functions
5. Redirects to success page

---

## 📊 **View Functions Logs:**

```bash
firebase functions:log
```

Or in Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select project: `wad2-login-5799b`
3. Click **Functions** in left menu
4. Click **Logs** tab

---

## 🔑 **Stripe API Keys:**

### **Publishable Key (Frontend):**
```
pk_test_51SIrnNLffQP02jW1smvV9ZhxCqSBmrGrAggs1EPHGVqKK6pqy0Ou6IqvEPzPLOGZePWmxQZCpfBt030duTdKvBUD00rPG3tKOL
```
✅ Already in `checkout.html`

### **Secret Key (Backend/Functions):**
```
sk_test_51SIrnNLffQP02jW1V41F9l5emSSV1VGmEr1cIUbOUn0PmjcfPGBWKAZbujNpunhaJyLPKGS77wXkiLb3kjdOcFJu00IREvpkbz
```
✅ Already in `functions/index.js` (as fallback)

---

## ⚠️ **Important Notes:**

1. **No localhost needed** - Functions run on Firebase servers
2. **Functions URL** - Update region if different from `us-central1`
3. **CORS enabled** - Functions allow requests from any origin
4. **Environment variables** - Can set Stripe key via Firebase config
5. **Testing** - Use test cards in Stripe test mode

---

## 🎯 **Quick Start:**

1. **Deploy functions:**
   ```bash
   cd /Applications/MAMP/htdocs/wad2
   firebase deploy --only functions
   ```

2. **Test in browser:**
   - Go to checkout page
   - Select Stripe payment
   - Click "Complete Payment"
   - Should work via Firebase Functions!

---

## 🔍 **Troubleshooting:**

### **Error: "Function not found"**
- Check if functions are deployed: `firebase functions:list`
- Verify URL in `checkout.html` matches your deployment

### **Error: "CORS error"**
- Functions already have CORS enabled
- Check browser console for specific error

### **Error: "Stripe key invalid"**
- Verify secret key in `functions/index.js`
- Check Stripe dashboard for correct key

---

**Your checkout now uses Firebase Functions with Stripe! No localhost needed!** 🎉
