# ChopeLah 🍜

A web application that allows users to "chope" (reserve) seats at hawker centres in Singapore. Built with HTML, CSS, JavaScript, Express.js, Firebase, and Stripe.

## 🌐 Live Application

**Deployed URL:** [https://chopelah.onrender.com](https://chopelah.onrender.com)

> **Note:** The free tier on Render.com may spin down after 15 minutes of inactivity. The first request may take a few seconds to wake up the service.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

ChopeLah helps hawker centre visitors:
- Check available seats in real-time
- Reserve seats for specific time slots
- Order food online from hawker stalls
- Share food experiences in a community feed
- Manage their profile and booking history

The system aims to reduce congestion, improve fairness, and provide a digital experience for community dining spaces in Singapore.

## ✨ Features

- **User Authentication** - Firebase Authentication with email/password and OAuth (Google, Facebook)
- **Seat Reservation System** - Real-time seat booking with expiry timers
- **Online Food Ordering** - Browse menus, add to cart, and checkout with Stripe payments
- **Community Feed** - Instagram-style feed for sharing food photos and reviews
- **Profile Management** - Edit profile, view booking history, manage orders
- **Responsive Design** - Mobile-first design optimized for all devices
- **Real-time Updates** - Live seat availability and booking status

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

You'll also need accounts for:
- **Firebase** - [Sign up](https://firebase.google.com/) (already configured)
- **Stripe** - [Sign up](https://stripe.com/) (for payment processing)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd wad2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the project root:

```bash
cp .env.example .env  # If you have an example file
# OR create manually
```

### 4. Configure Environment Variables

See [Environment Variables](#environment-variables) section below for required values.

### 5. Start the Server

```bash
npm start
# OR
npm run dev
```

### 6. Open in Browser

Navigate to: **http://localhost:10000**

## 📝 Detailed Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Express.js (web server)
- CORS (Cross-Origin Resource Sharing)
- dotenv (environment variables)
- Stripe (payment processing)

### Step 2: Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=10000
NODE_ENV=development

# Stripe Configuration (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Firebase Configuration (Already configured for project: wad2-login-5799b)
FIREBASE_API_KEY=AIzaSyApmvl3E-sbQMZfadYGfa4P0EJ6N7IEZmo
FIREBASE_AUTH_DOMAIN=wad2-login-5799b.firebaseapp.com
FIREBASE_PROJECT_ID=wad2-login-5799b
FIREBASE_STORAGE_BUCKET=wad2-login-5799b.appspot.com
FIREBASE_MESSAGING_SENDER_ID=148986270821
FIREBASE_APP_ID=1:148986270821:web:fc17df5adf49b464a1628c

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:10000
```

### Step 3: Get Your API Keys

#### Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Replace the placeholder values in your `.env` file

#### Stripe Webhook Secret (Optional for local development)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Create a new webhook endpoint: `http://localhost:10000/api/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the **Signing secret** (starts with `whsec_`)
5. Add to your `.env` file

> **Note:** Firebase keys are already configured. You don't need to change them unless you're using a different Firebase project.

### Step 4: Run the Application

```bash
# Start the development server
npm start

# OR use the dev script (same as start)
npm run dev
```

The server will start on **http://localhost:10000**

### Step 5: Test the Application

1. Open your browser and go to `http://localhost:10000`
2. Create an account or login
3. Try booking a seat at a food centre
4. Test the food ordering flow
5. For payment testing, use Stripe test card: `4242 4242 4242 4242`

## 🔐 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port number | Yes | `10000` |
| `NODE_ENV` | Environment mode | Yes | `development` or `production` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | Yes | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | No* | `whsec_...` |
| `FIREBASE_API_KEY` | Firebase API key | Yes | `AIzaSy...` |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes | `*.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes | `wad2-login-5799b` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes | `*.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes | `148986270821` |
| `FIREBASE_APP_ID` | Firebase app ID | Yes | `1:148986270821:web:...` |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | `http://localhost:10000` |

*Required for production deployment

> **⚠️ Important:** Never commit your `.env` file to version control. It's already in `.gitignore`.

## 🏃 Running the Application

### Development Mode

```bash
npm start
# Server runs on http://localhost:10000
```

### Production Mode

```bash
NODE_ENV=production npm start
```

### Available Scripts

```bash
npm start          # Start the server (default port 10000)
npm run dev        # Same as npm start
npm run server     # Same as npm start
npm test           # Run tests (not configured yet)
```

## 📁 Project Structure

```
wad2/
├── src/                          # Frontend client code
│   ├── index.html               # Main entry page (login/signup)
│   ├── pages/                   # Application pages
│   │   ├── admin/               # Admin pages
│   │   ├── chope/               # Seat reservation pages
│   │   ├── community/           # Community feed pages
│   │   ├── crowd/               # Crowd monitoring pages
│   │   ├── order/               # Food ordering pages
│   │   └── profile/              # User profile pages
│   ├── styles/                  # CSS files
│   │   ├── main.css            # General layout & theme
│   │   └── components.css      # Reusable component styles
│   ├── scripts/                 # JavaScript files
│   │   ├── main.js            # Core application logic
│   │   ├── firebaseauth.js    # Firebase authentication
│   │   ├── notification.js    # Notification system
│   │   └── orderSession.js    # Order session management
│   ├── partials/               # Reusable HTML components
│   │   └── navbar.html        # Navigation bar
│   └── img/                    # Static images
├── server/                      # Backend-for-Frontend API
│   ├── index.js               # Main server entry point
│   ├── routes/                 # API endpoints
│   │   ├── payments.js        # Payment endpoints
│   │   ├── reservations.js    # Reservation endpoints
│   │   └── seats.js           # Seat endpoints
│   ├── services/               # Business logic
│   │   └── reservationsService.js
│   ├── external/               # External API integrations
│   │   ├── stripeClient.js    # Stripe API client
│   │   └── visionClient.js    # Google Cloud Vision API
│   └── db/                     # Database layer
│       ├── client.js          # Database connection
│       └── queries/           # Database queries
│           └── reservationsRepo.js
├── functions/                   # Firebase Cloud Functions
│   ├── index.js               # Functions entry point
│   └── package.json           # Functions dependencies
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md        # System architecture
│   ├── FILESTRUCTURE.md       # File structure details
│   ├── ENV_SETUP.md           # Environment setup guide
│   ├── QUICK_START.md         # Quick start guide
│   └── ...                    # Additional documentation
├── .env                        # Environment variables (not in git)
├── .gitignore                  # Git ignore rules
├── package.json               # Project dependencies
├── render.yaml                # Render.com deployment config
└── README.md                  # This file
```

## 🛠 Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (with CSS Variables for theming)
- **JavaScript (ES6+)** - Client-side logic
- **Bootstrap 5** - UI components
- **Bootstrap Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Firebase** - Authentication, Firestore database, Storage
- **Stripe** - Payment processing
- **Google Cloud Vision API** - Image analysis

### Development Tools
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

## 🚢 Deployment

### Deploying to Render.com

The application is configured for deployment on Render.com. See `docs/RENDER_DEPLOYMENT.md` for detailed instructions.

#### Quick Deployment Steps:

1. **Push code to GitHub/GitLab**
2. **Create a new Web Service on Render**
   - Connect your repository
   - Render will auto-detect `render.yaml`
3. **Set Environment Variables** in Render Dashboard:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FIREBASE_API_KEY` (optional, has fallback)
4. **Configure Stripe Webhook**:
   - Endpoint: `https://your-app.onrender.com/api/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. **Add Render domain to Firebase**:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add: `your-app.onrender.com`

#### Current Deployment

- **URL:** [https://chopelah.onrender.com](https://chopelah.onrender.com)
- **Status:** Live (may spin down after inactivity on free tier)
- **Auto-deploy:** Enabled (deploys on push to main branch)

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture overview
- **[FILESTRUCTURE.md](docs/FILESTRUCTURE.md)** - Detailed file structure
- **[ENV_SETUP.md](docs/ENV_SETUP.md)** - Environment variables guide
- **[QUICK_START.md](docs/QUICK_START.md)** - 60-second quick start guide
- **[RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md)** - Deployment guide
- **[FIREBASE_OAUTH_SETUP.md](docs/FIREBASE_OAUTH_SETUP.md)** - OAuth configuration
- **[STRIPE_SANDBOX_SETUP.md](docs/STRIPE_SANDBOX_SETUP.md)** - Stripe setup guide

## 🐛 Troubleshooting

### Server won't start

**Problem:** `Error: Cannot find module` or port already in use

**Solutions:**
- Run `npm install` to ensure all dependencies are installed
- Check if port 10000 is already in use: `lsof -i :10000` (Mac/Linux) or `netstat -ano | findstr :10000` (Windows)
- Change `PORT` in `.env` to a different port (e.g., `3000`)

### Can't login / Firebase errors

**Problem:** Authentication not working

**Solutions:**
- Verify `.env` file has correct Firebase configuration
- Check browser console for Firebase errors
- Ensure Firebase project is active in Firebase Console
- Verify authorized domains in Firebase Console (should include `localhost`)

### Payment doesn't work

**Problem:** Stripe payment fails

**Solutions:**
- Verify `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` are set correctly
- Check Stripe Dashboard for API key status
- Use test mode keys (start with `sk_test_` and `pk_test_`)
- Test with Stripe test card: `4242 4242 4242 4242`

### CORS errors

**Problem:** `Access-Control-Allow-Origin` errors

**Solutions:**
- Check `ALLOWED_ORIGINS` in `.env` includes your frontend URL
- Verify CORS configuration in `server/index.js`
- Ensure frontend URL matches exactly (including `http://` vs `https://`)

### Static files not loading

**Problem:** CSS/JS/images not loading

**Solutions:**
- Verify `server/index.js` serves static files from `src/` directory
- Check file paths are correct (case-sensitive)
- Clear browser cache
- Check browser console for 404 errors

### Seat booking not working

**Problem:** Can't book seats or see availability

**Solutions:**
- Check Firebase Firestore is initialized
- Verify Firebase rules allow read/write access
- Check browser console for Firebase errors
- Ensure user is logged in

## 🧪 Testing

### Test Cards (Stripe)

Use these test card numbers for payment testing:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review documentation in the `docs/` folder
3. Check browser console and server logs for errors
4. Verify all environment variables are set correctly

## 📄 License

ISC License

## 👥 Contributors

ChopeLah Team

---

**Last Updated:** December 2024

**Version:** 1.0.0
