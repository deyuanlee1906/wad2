# Environment Variables for Render Dashboard

## 📋 Complete List

Copy and paste these into your Render Dashboard → Your Service → Environment tab.

---

## 🔴 REQUIRED (Must Have)

These are essential for your app to work:

### 1. STRIPE_SECRET_KEY
- **Value**: `sk_test_...` or `sk_live_...`
- **Where to get**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → API Keys
- **Format**: Starts with `sk_test_` (test) or `sk_live_` (production)
- **Required for**: Payment processing

### 2. STRIPE_WEBHOOK_SECRET
- **Value**: `whsec_...`
- **Where to get**: 
  1. First, deploy your app to Render
  2. Get your Render URL: `https://your-app.onrender.com`
  3. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
  4. Add endpoint: `https://your-app.onrender.com/api/webhook`
  5. Copy the "Signing secret" shown after creating
- **Format**: Starts with `whsec_`
- **Required for**: Stripe webhook signature verification

---

## 🟡 RECOMMENDED (Strongly Recommended)

These will use fallback values if not set, but it's better to set them:

### 3. FIREBASE_API_KEY
- **Value**: `AIzaSy...`
- **Where to get**: 
  - [Firebase Console](https://console.firebase.google.com/)
  - Select project: **wad2-login-5799b**
  - Go to: Project Settings → General tab
  - Under "Your apps" → Web app config
  - Copy the `apiKey` value
- **Format**: Starts with `AIzaSy`
- **Note**: If not set, uses hardcoded fallback (less secure for production)

---

## 🟢 OPTIONAL (Already Have Defaults)

These have default values set in code, but you can override them if needed:

### 4. FIREBASE_AUTH_DOMAIN
- **Default**: `wad2-login-5799b.firebaseapp.com`
- **Optional**: Only set if different from default

### 5. FIREBASE_PROJECT_ID
- **Default**: `wad2-login-5799b`
- **Optional**: Only set if different from default

### 6. FIREBASE_STORAGE_BUCKET
- **Default**: `wad2-login-5799b.appspot.com`
- **Optional**: Only set if different from default

### 7. FIREBASE_MESSAGING_SENDER_ID
- **Default**: `148986270821`
- **Optional**: Only set if different from default

### 8. FIREBASE_APP_ID
- **Default**: `1:148986270821:web:fc17df5adf49b464a1628c`
- **Optional**: Only set if different from default

---

## ⚙️ AUTO-SET (Render Handles These)

These are automatically set by Render - **you don't need to add them:**

- **PORT**: Automatically set to `10000` (Render's internal port)
- **NODE_ENV**: Can be set to `production` if you want, but Render handles it

---

## 📝 Quick Copy-Paste Template

When adding variables in Render Dashboard, use this format:

```
Key: STRIPE_SECRET_KEY
Value: sk_test_your_key_here

Key: STRIPE_WEBHOOK_SECRET
Value: whsec_your_webhook_secret_here

Key: FIREBASE_API_KEY
Value: AIzaSy_your_api_key_here
```

---

## 🎯 Minimum Setup (Just Required Variables)

For the app to work, you **must** have at least these 2:

1. ✅ `STRIPE_SECRET_KEY`
2. ✅ `STRIPE_WEBHOOK_SECRET` (after creating webhook endpoint)

---

## 🔄 After First Deployment

1. **Deploy your app** (even without `STRIPE_WEBHOOK_SECRET` first)
2. **Get your Render URL** (e.g., `https://chope-lah.onrender.com`)
3. **Create Stripe Webhook** pointing to `https://chope-lah.onrender.com/api/webhook`
4. **Copy webhook secret** and add as `STRIPE_WEBHOOK_SECRET`
5. **Redeploy** or wait for auto-deploy

---

## 📸 Step-by-Step in Render Dashboard

1. Go to your Render Dashboard
2. Click on your service (e.g., "chope-lah")
3. Click on **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Enter:
   - **Key**: `STRIPE_SECRET_KEY`
   - **Value**: Paste your Stripe secret key
6. Click **"Save Changes"**
7. Repeat for each variable

---

## ✅ Verification Checklist

After adding variables, verify:

- [ ] `STRIPE_SECRET_KEY` is set
- [ ] `STRIPE_WEBHOOK_SECRET` is set (after webhook creation)
- [ ] `FIREBASE_API_KEY` is set (recommended)
- [ ] No typos in variable names (case-sensitive!)
- [ ] No extra spaces in values
- [ ] Service redeployed after adding variables

---

## 🐛 Common Issues

### Issue: "STRIPE_SECRET_KEY not set" warning
**Solution**: Add the variable in Render Dashboard → Environment tab

### Issue: Webhook signature verification fails
**Solution**: 
- Make sure `STRIPE_WEBHOOK_SECRET` matches the one from Stripe Dashboard
- Use the secret from the **production webhook**, not local testing

### Issue: Firebase not working
**Solution**: 
- Set `FIREBASE_API_KEY` explicitly
- Make sure Render domain is in Firebase Authorized domains

---

## 💡 Pro Tips

1. **Use test keys first**: Start with `sk_test_...` for testing
2. **Secure your secrets**: Never commit these to Git
3. **Update webhook secret**: When you change webhook endpoints, update the secret
4. **Test after changes**: Always test payment flow after adding/updating variables

---

**Last Updated**: After Render deployment preparation

