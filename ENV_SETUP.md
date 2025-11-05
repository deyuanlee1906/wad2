# Environment Variables Setup Guide

## Quick Start

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=10000
NODE_ENV=development

# Stripe Configuration (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Firebase Configuration (Already configured for your project)
FIREBASE_API_KEY=AIzaSyApmvl3E-sbQMZfadYGfa4P0EJ6N7IEZmo
FIREBASE_AUTH_DOMAIN=wad2-login-5799b.firebaseapp.com
FIREBASE_PROJECT_ID=wad2-login-5799b
FIREBASE_STORAGE_BUCKET=wad2-login-5799b.appspot.com
FIREBASE_MESSAGING_SENDER_ID=148986270821
FIREBASE_APP_ID=1:148986270821:web:fc17df5adf49b464a1628c

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:10000
```

## How to Get Your Keys

### Stripe Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)

### Stripe Webhook Secret
1. Go to https://dashboard.stripe.com/test/webhooks
2. Create a new webhook endpoint: `http://localhost:10000/api/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the **Signing secret** (starts with `whsec_`)

### Firebase Keys
Already configured in the template above using your existing project.

## Important Notes

- **NEVER** commit `.env` to version control
- The `.gitignore` file should already exclude `.env`
- Use the template above to create your local `.env` file
- For production (Render.com), set these as environment variables in the dashboard

