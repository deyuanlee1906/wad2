# 🔧 Firebase Function CORS Fix - Deployment Guide

## ✅ What Was Fixed

The `createPaymentLink` Firebase Cloud Function has been updated with proper CORS handling:

1. **CORS Package**: Uses the official `cors` npm package
2. **Preflight Support**: Properly handles OPTIONS requests
3. **Origin Allowlist**: Allows requests from `http://localhost:10000`
4. **Headers**: Sets proper CORS headers for all responses

---

## 📦 Step 1: Install Dependencies

Before deploying, you need to install the required npm packages in the functions directory:

```bash
cd /Applications/MAMP/htdocs/wad2/proj/wad2/functions
npm install
```

This will install:
- `firebase-functions` - Firebase Functions SDK
- `firebase-admin` - Firebase Admin SDK
- `stripe` - Stripe API library
- `cors` - CORS middleware package

---

## 🚀 Step 2: Deploy the Function

### Option A: Deploy Only the createPaymentLink Function (Recommended)

```bash
cd /Applications/MAMP/htdocs/wad2/proj/wad2
firebase deploy --only functions:createPaymentLink
```

This will:
- Upload the updated function code
- Install dependencies automatically
- Deploy only the `createPaymentLink` function (faster)

### Option B: Deploy All Functions

```bash
cd /Applications/MAMP/htdocs/wad2/proj/wad2
firebase deploy --only functions
```

This deploys all functions in your project.

---

## ✅ Step 3: Verify Deployment

After deployment, Firebase CLI will show output like:

```
✔  functions[createPaymentLink(us-central1)] Successful create operation.
Function URL (createPaymentLink): https://us-central1-wad2-login-5799b.cloudfunctions.net/createPaymentLink
```

### Test the Function

You can test the CORS setup with a curl command:

```bash
# Test OPTIONS preflight request
curl -X OPTIONS \
  https://us-central1-wad2-login-5799b.cloudfunctions.net/createPaymentLink \
  -H "Origin: http://localhost:10000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

You should see:
- `Access-Control-Allow-Origin: http://localhost:10000`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- Status: `200 OK`

---

## 🔍 Step 4: Check Function Logs

Monitor the function logs to ensure it's working:

```bash
firebase functions:log --only createPaymentLink
```

Or view in Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `wad2-login-5799b`
3. Click **Functions** → **Logs**
4. Filter by `createPaymentLink`

---

## 📝 Function Code Summary

The updated function:

1. **Uses CORS middleware**: Wraps the function with `cors(corsOptions)`
2. **Handles preflight**: Automatically responds to OPTIONS requests
3. **Sets headers**: Manually sets CORS headers as backup
4. **Validates origin**: Only allows `http://localhost:10000`
5. **Error handling**: Returns proper CORS headers even on errors

### Key Features:

- ✅ Preflight OPTIONS requests handled automatically
- ✅ CORS headers set on all responses (success and error)
- ✅ Origin validation for security
- ✅ Proper error handling with CORS headers

---

## 🐛 Troubleshooting

### Issue: "Function failed to deploy"

**Solution:**
```bash
cd functions
npm install
cd ..
firebase deploy --only functions:createPaymentLink
```

### Issue: "CORS error still occurring"

**Check:**
1. Verify the function is deployed: `firebase functions:list`
2. Check browser console for exact error message
3. Verify origin matches exactly: `http://localhost:10000`
4. Check function logs: `firebase functions:log --only createPaymentLink`

### Issue: "Module not found: cors"

**Solution:**
```bash
cd functions
npm install cors
cd ..
firebase deploy --only functions:createPaymentLink
```

### Issue: "Stripe key error"

The function uses this priority:
1. Environment variable: `process.env.STRIPE_SECRET_KEY`
2. Firebase config: `functions.config().stripe.secret_key`
3. Hardcoded fallback (for testing)

To set via Firebase config:
```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
```

---

## 🔄 Update Function Code

If you need to make changes:

1. **Edit** `functions/index.js`
2. **Save** the file
3. **Deploy** again:
   ```bash
   firebase deploy --only functions:createPaymentLink
   ```

---

## 📚 Additional Commands

```bash
# List all deployed functions
firebase functions:list

# View function details
firebase functions:describe createPaymentLink

# View real-time logs
firebase functions:log --only createPaymentLink

# Delete function (if needed)
firebase functions:delete createPaymentLink
```

---

## ✅ Deployment Checklist

- [ ] Installed dependencies: `cd functions && npm install`
- [ ] Logged into Firebase: `firebase login`
- [ ] Deployed function: `firebase deploy --only functions:createPaymentLink`
- [ ] Verified deployment: Check Firebase Console
- [ ] Tested CORS: Check browser console for errors
- [ ] Checked logs: `firebase functions:log`

---

**Your Firebase Function is now ready with proper CORS support!** 🎉

