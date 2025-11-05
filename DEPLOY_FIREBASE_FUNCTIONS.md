# 🚀 Deploy Firebase Functions for Payment Links

## ✅ **What's Been Set Up:**

1. ✅ **Firebase Function Created** - `createPaymentLink` function in `functions/index.js`
2. ✅ **Checkout Updated** - Now uses Firebase Functions instead of local server
3. ✅ **Payment Link Flow** - Redirects to Stripe Payment Link after creation

---

## 📋 **Prerequisites:**

1. **Firebase CLI installed:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged into Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project (if not already done):**
   ```bash
   cd /Applications/MAMP/htdocs/wad2
   firebase init functions
   ```
   - Select: JavaScript
   - Use ESLint: Yes (or No)
   - Install dependencies: Yes

---

## 🔑 **Stripe Secret Key:**

The Stripe secret key is **hardcoded** in the function for testing purposes. This is fine for development, but for production you should:

### **Option 1: Use Firebase Functions Config (Recommended for v1 API)**

```bash
firebase functions:config:set stripe.secret_key="sk_test_51SIrnNLffQP02jW1V41F9l5emSSV1VGmEr1cIUbOUn0PmjcfPGBWKAZbujNpunhaJyLPKGS77wXkiLb3kjdOcFJu00IREvpkbz"
```

### **Option 2: Hardcoded (Current - Works for Testing)**

The function already has the Stripe key hardcoded, so you can deploy immediately without any setup.

**Note:** For production, use environment variables or Firebase Config instead of hardcoding.

---

## 🚀 **Deploy Functions:**

### **Step 1: Navigate to project directory**
```bash
cd /Applications/MAMP/htdocs/wad2
```

### **Step 2: Deploy all functions**
```bash
firebase deploy --only functions
```

### **Step 3: Deploy specific function (if you only want payment link)**
```bash
firebase deploy --only functions:createPaymentLink
```

---

## ✅ **Verify Deployment:**

### **Check Functions URL:**
After deployment, Firebase will show you the function URLs:
```
✔  functions[createPaymentLink(us-central1)] Successful create operation.
Function URL (createPaymentLink): https://us-central1-wad2-login-5799b.cloudfunctions.net/createPaymentLink
```

### **Test the Function:**
```bash
curl -X POST https://us-central1-wad2-login-5799b.cloudfunctions.net/createPaymentLink \
  -H "Content-Type: application/json" \
  -d '{"items":[{"name":"Test Item","price":10,"quantity":1}],"totalAmount":10,"orderId":"TEST123"}'
```

---

## 🔍 **Troubleshooting:**

### **Error: "Function failed to deploy"**
1. Check that `functions/package.json` has `stripe` dependency
2. Run `cd functions && npm install`
3. Try deploying again

### **Error: "STRIPE_SECRET_KEY not found"**
1. Make sure you set the environment variable in Firebase Console
2. For new deployments, you may need to use:
   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY
   ```
   Then enter your secret key when prompted

### **Error: "CORS error"**
- The function already has `cors: true` enabled
- Make sure your frontend origin is allowed

### **Check Function Logs:**
```bash
firebase functions:log
```

Or view in Firebase Console:
- Go to **Functions** → **Logs** tab

---

## 📝 **Function Details:**

### **Endpoint:**
```
POST https://us-central1-wad2-login-5799b.cloudfunctions.net/createPaymentLink
```

### **Request Body:**
```json
{
  "items": [
    {
      "name": "Food Item",
      "price": 10.50,
      "quantity": 2,
      "description": "Delicious food",
      "image": "https://example.com/image.jpg"
    }
  ],
  "shippingFee": 0,
  "totalAmount": 21.00,
  "orderId": "ORD123456",
  "stallName": "Peanuts Soup",
  "foodCentre": "Maxwell Food Centre",
  "pickupOption": "Dine In",
  "pickupTime": "12:00PM",
  "successUrl": "https://your-domain.com/pages/order/orderconfirmed.html"
}
```

### **Response:**
```json
{
  "url": "https://buy.stripe.com/test_xxx",
  "paymentLinkId": "plink_xxx"
}
```

---

## 🎯 **After Deployment:**

1. **Test the checkout flow:**
   - Go to checkout page
   - Select "Credit/Debit Card"
   - Click "Complete Payment"
   - Should redirect to Stripe Payment Link

2. **Check Firebase Console:**
   - Go to **Functions** → **Logs**
   - Should see logs when payment link is created

3. **Update checkout.html if needed:**
   - If your Firebase region is different, update `getFirebaseFunctionsUrl()` in checkout.html
   - Current: `us-central1`
   - Change if your functions are in a different region

---

## 🔄 **Update Function Code:**

If you make changes to `functions/index.js`:

1. **Save the file**
2. **Deploy again:**
   ```bash
   firebase deploy --only functions:createPaymentLink
   ```

---

## 📚 **Useful Commands:**

```bash
# View all functions
firebase functions:list

# View function logs
firebase functions:log --only createPaymentLink

# Delete a function
firebase functions:delete createPaymentLink

# View function config
firebase functions:config:get
```

---

**Your Firebase Functions are now ready to handle payment links!** 🎉
