# Render.com Deployment Guide for ChopeLah

## 🚀 Quick Start

This guide will help you deploy your ChopeLah application to Render.com.

---

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub/GitLab Repository**: Your code should be in a Git repository
3. **Stripe Account**: For payment processing
4. **Firebase Account**: Already set up (project: wad2-login-5799b)

---

## 🔧 Step 1: Prepare Environment Variables

Before deploying, gather these values:

### Required Environment Variables:

1. **STRIPE_SECRET_KEY**
   - Get from: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Format: `sk_live_...` (production) or `sk_test_...` (testing)

2. **STRIPE_WEBHOOK_SECRET**
   - Get from: Stripe Dashboard → Developers → Webhooks
   - Format: `whsec_...`
   - **Important**: This is different for local vs production webhooks

3. **FIREBASE_API_KEY** (optional, but recommended)
   - Get from: Firebase Console → Project Settings → General
   - Format: `AIzaSy...`
   - If not set, the app will use fallback values

### Optional Environment Variables (with fallbacks):

- `FIREBASE_AUTH_DOMAIN` (default: `wad2-login-5799b.firebaseapp.com`)
- `FIREBASE_PROJECT_ID` (default: `wad2-login-5799b`)
- `FIREBASE_STORAGE_BUCKET` (default: `wad2-login-5799b.appspot.com`)
- `FIREBASE_MESSAGING_SENDER_ID` (default: `148986270821`)
- `FIREBASE_APP_ID` (default: `1:148986270821:web:fc17df5adf49b464a1628c`)

---

## 📤 Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Push your code to GitHub/GitLab** (make sure `render.yaml` is in the root)

2. **Create a new Web Service on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your repository
   - Render will auto-detect `render.yaml` and use those settings

3. **Set Environment Variables:**
   - Go to your service → Environment tab
   - Add the required variables:
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `FIREBASE_API_KEY` (recommended)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy automatically

### Option B: Manual Configuration

1. **Create a new Web Service:**
   - Go to Render Dashboard → "New +" → "Web Service"
   - Connect your Git repository

2. **Configure Build & Start:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

3. **Set Environment Variables:**
   - Add all required variables (see Step 1)

4. **Advanced Settings:**
   - **Plan**: Starter (free tier) or higher
   - **Auto-Deploy**: Yes (deploys on git push)
   - **Health Check Path**: `/api/health`

---

## 🔗 Step 3: Configure Stripe Webhooks

After deployment, configure Stripe to send webhooks to your Render URL:

1. **Get your Render URL:**
   - Format: `https://your-app-name.onrender.com`
   - Found in: Render Dashboard → Your Service → Settings

2. **Add Webhook in Stripe:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - **Endpoint URL**: `https://your-app-name.onrender.com/api/webhook`
   - **Events to listen to**:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

3. **Copy Webhook Signing Secret:**
   - After creating the webhook, copy the "Signing secret"
   - Update `STRIPE_WEBHOOK_SECRET` in Render environment variables

4. **Test the Webhook:**
   - Use Stripe's test webhook feature
   - Or create a test payment and check Render logs

---

## 🔥 Step 4: Configure Firebase Authorized Domains

Firebase needs to know your Render domain:

1. **Go to Firebase Console:**
   - [Firebase Console](https://console.firebase.google.com/)
   - Select project: **wad2-login-5799b**

2. **Add Authorized Domain:**
   - Go to: Authentication → Settings → Authorized domains
   - Click "Add domain"
   - Enter: `your-app-name.onrender.com`
   - Also add: `*.onrender.com` (for preview deployments if needed)

3. **Verify OAuth Providers:**
   - Ensure Google and Facebook login are enabled
   - Check OAuth consent screen in Google Cloud Console

---

## ✅ Step 5: Verify Deployment

Test these endpoints after deployment:

1. **Health Check:**
   - `https://your-app-name.onrender.com/api/health`
   - Should return: `{"status":"OK",...}`

2. **Firebase Config:**
   - `https://your-app-name.onrender.com/api/firebase-config`
   - Should return Firebase configuration JSON

3. **Homepage:**
   - `https://your-app-name.onrender.com/`
   - Should load your application

4. **Stripe Webhook:**
   - Create a test payment in your app
   - Check Render logs for webhook events

---

## 🐛 Troubleshooting

### Issue: App returns 404

**Solution:**
- Check that `server/index.js` is the correct entry point
- Verify `package.json` start command is `npm start`
- Check Render build logs for errors

### Issue: Firebase not working

**Solution:**
- Check browser console for Firebase errors
- Verify `FIREBASE_API_KEY` is set in Render
- Ensure Render domain is in Firebase Authorized domains
- Check that `/api/firebase-config` endpoint works

### Issue: Stripe webhook not receiving events

**Solution:**
- Verify webhook URL is correct: `https://your-app.onrender.com/api/webhook`
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Test with Stripe CLI locally first (see webhook testing guide)
- Check Render logs for webhook errors

### Issue: Environment variables not working

**Solution:**
- Verify variables are set in Render Dashboard → Environment
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

### Issue: Static files not loading

**Solution:**
- Verify `server/index.js` serves static files from `src/` directory
- Check file paths are correct
- Ensure Express static middleware is configured

---

## 📊 Monitoring

### View Logs:
- Render Dashboard → Your Service → Logs
- Real-time logs and build logs available

### Health Checks:
- Render automatically checks `/api/health`
- Service auto-restarts if health check fails

### Metrics:
- View CPU, Memory usage in Render Dashboard
- Monitor request counts and response times

---

## 🔄 Updating Deployment

### Automatic Deploys:
- Push to your main branch → Auto-deploys
- Preview deployments for pull requests (if enabled)

### Manual Deploy:
- Render Dashboard → Your Service → Manual Deploy
- Choose branch/commit to deploy

### Environment Variables:
- Update in Render Dashboard → Environment tab
- Changes require a redeploy to take effect

---

## 💰 Cost & Limits

### Free Tier:
- ✅ 750 hours/month free
- ✅ SSL certificate included
- ✅ Custom domain support
- ⚠️ Service spins down after 15 mins of inactivity (wakes up on request)

### Paid Plans:
- Starts at $7/month (Starter plan)
- No spin-down
- More resources
- Better performance

---

## 🔒 Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enabled (automatic on Render)
- [ ] Firebase authorized domains configured
- [ ] Stripe webhook secret secured
- [ ] CORS properly configured
- [ ] No sensitive data in logs

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Firebase Hosting Setup](https://firebase.google.com/docs/hosting)

---

## 🆘 Need Help?

1. Check Render build logs
2. Check Render runtime logs
3. Test endpoints individually
4. Review environment variables
5. Check browser console for client-side errors

**Last Updated:** After Render deployment preparation

