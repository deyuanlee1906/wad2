# 🚀 Getting Started with ChopeLah

This guide will help you set up and run the ChopeLah application on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Stripe Account** (for payment testing)
- **Firebase Project** (already configured: wad2-login-5799b)

## 🛠️ Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Environment File

Create a `.env` file in the project root directory:

```bash
# On Windows PowerShell:
New-Item .env -ItemType File

# On Mac/Linux:
touch .env
```

### Step 3: Configure Environment Variables

Open the `.env` file and add the following:

```env
# Server Configuration
PORT=10000
NODE_ENV=development

# Stripe Configuration
# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Optional: Webhook secret (for testing webhooks locally)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Firebase Configuration (Already Set Up)
FIREBASE_API_KEY=AIzaSyApmvl3E-sbQMZfadYGfa4P0EJ6N7IEZmo
FIREBASE_AUTH_DOMAIN=wad2-login-5799b.firebaseapp.com
FIREBASE_PROJECT_ID=wad2-login-5799b
FIREBASE_STORAGE_BUCKET=wad2-login-5799b.appspot.com
FIREBASE_MESSAGING_SENDER_ID=148986270821
FIREBASE_APP_ID=1:148986270821:web:fc17df5adf49b464a1628c

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:10000
```

### Step 4: Get Your Stripe Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Replace the placeholder values in your `.env` file

### Step 5: Run the Application

```bash
npm start
```

You should see:

```
==================================================
🚀 ChopeLah Server Started
==================================================
📍 Server running on: http://localhost:10000
🌐 Environment: development
💳 Payment API: http://localhost:10000/api/payments
🪑 Seats API: http://localhost:10000/api/seats
📅 Reservations API: http://localhost:10000/api/reservations
❤️  Health Check: http://localhost:10000/api/health
🔥 Firebase Config: http://localhost:10000/api/firebase-config
==================================================
```

### Step 6: Open Your Browser

Navigate to: **http://localhost:10000**

---

## 🎯 What Works Now

### ✅ Features Fully Functional
- **User Authentication** (Email/Password, Google OAuth)
- **Seat Reservation System** (View & Book Seats)
- **Online Food Ordering** (Browse Menu, Add to Cart)
- **Stripe Payment Integration** (Test Card Payments)
- **Community Feed** (View & Post Reviews)
- **User Profiles** (View & Edit Profile)

### 🔄 API Endpoints Available
- `GET /api/health` - Server health check
- `POST /api/create-checkout-session` - Create Stripe payment
- `GET /api/verify-checkout-session/:id` - Verify payment
- `GET /api/firebase-config` - Get Firebase configuration
- `GET /api/stripe-config` - Get Stripe public key
- `GET /api/reservations/policies` - Get reservation rules
- `POST /api/reservations/validate` - Validate reservation
- `GET /api/seats/availability/:foodCentre` - Check seat availability

---

## 🧪 Testing Payments

### Test Card Numbers
Use these Stripe test cards:

| Card Number         | Result                    |
|---------------------|---------------------------|
| 4242 4242 4242 4242 | Success                   |
| 4000 0000 0000 9995 | Declined (insufficient)   |
| 4000 0000 0000 0002 | Declined (card declined)  |

- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Testing Payment Flow
1. Go to **Order** section
2. Select a food centre (Newton, Maxwell, or Changi Village)
3. Browse stalls and add items to cart
4. Click **Proceed to Checkout**
5. Choose **Credit/Debit Card** payment method
6. Click **Complete Payment**
7. Use test card `4242 4242 4242 4242`
8. Complete payment
9. You'll be redirected to order confirmation

---

## 🔧 Troubleshooting

### Issue: "STRIPE_SECRET_KEY not set"
**Solution**: Make sure you've created `.env` file and added your Stripe secret key.

### Issue: "CORS Error" or "Origin not allowed"
**Solution**: Check that `ALLOWED_ORIGINS` in `.env` includes your current URL.

### Issue: Port 10000 already in use
**Solution**: Change `PORT=10000` to another port in `.env` (e.g., `PORT=3000`).

### Issue: Firebase authentication not working
**Solution**: 
- Make sure you're using a valid email format
- Check browser console for detailed error messages
- Verify Firebase configuration in `.env`

### Issue: Can't create account or login
**Solution**:
1. Open browser DevTools (F12)
2. Check Console for Firebase errors
3. Verify Firebase project is active
4. Check that authorized domains include `localhost`

---

## 📁 Project Structure

```
chope-lah/
├── server/                    # Backend server
│   ├── index.js              # Main server file
│   ├── routes/               # API routes
│   │   ├── payments.js       # Stripe payment endpoints
│   │   ├── reservations.js   # Reservation endpoints
│   │   └── seats.js          # Seat availability endpoints
│   ├── services/             # Business logic
│   │   └── reservationsService.js
│   ├── db/                   # Database layer
│   │   ├── client.js         # DB connection
│   │   └── queries/          # Database queries
│   └── external/             # External API clients
│       ├── stripeClient.js   # Stripe integration
│       └── visionClient.js   # Google Vision API (placeholder)
├── src/                      # Frontend files
│   ├── index.html           # Landing/login page
│   ├── pages/               # Application pages
│   ├── scripts/             # JavaScript files
│   │   ├── firebaseauth.js  # Authentication logic
│   │   └── main.js          # Core app logic
│   ├── styles/              # CSS files
│   └── img/                 # Images
├── .env                     # Environment variables (create this!)
├── package.json             # Dependencies and scripts
└── ENV_SETUP.md            # Environment setup guide
```

---

## 🎓 Development Commands

```bash
# Install dependencies
npm install

# Start server (production mode)
npm start

# Start server (development mode)
npm run dev

# Start server (alternative)
npm run server
```

---

## 🔐 Security Notes

- ⚠️ **NEVER** commit `.env` file to Git
- ⚠️ Keep your Stripe keys secret
- ⚠️ Use test keys for development
- ⚠️ Switch to live keys only in production

---

## 🌐 Accessing the Application

Once running, access:
- **Main App**: http://localhost:10000
- **Health Check**: http://localhost:10000/api/health

---

## 📚 Additional Resources

- **ENV_SETUP.md** - Detailed environment variable guide
- **DEPLOYMENT_READY.md** - Production deployment checklist
- **RENDER_DEPLOYMENT.md** - Deploy to Render.com
- **STRIPE_SANDBOX_SETUP.md** - Stripe configuration guide
- **FIREBASE_OAUTH_SETUP.md** - Firebase OAuth setup

---

## 🆘 Need Help?

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Review browser console for errors (F12)
3. Check server terminal for error messages
4. Verify all environment variables are set correctly
5. Ensure you're using the correct Stripe test keys

---

## ✅ Verification Checklist

Before using the app, verify:

- [ ] Node.js v18+ installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created
- [ ] Stripe keys added to `.env`
- [ ] Firebase config added to `.env`
- [ ] Server starts without errors (`npm start`)
- [ ] Can access http://localhost:10000
- [ ] Can see login page
- [ ] Can create account / login
- [ ] Can browse food centres
- [ ] Can add items to cart
- [ ] Can checkout with test card

---

**🎉 You're all set! Enjoy using ChopeLah!**

