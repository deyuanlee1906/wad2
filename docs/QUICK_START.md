# ⚡ ChopeLah - Quick Start (60 Seconds)

## 1️⃣ Install Dependencies (15 seconds)
```bash
npm install
```

## 2️⃣ Create .env File (20 seconds)

Create a file named `.env` in the project root with this content:

```env
PORT=10000
NODE_ENV=development
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
FIREBASE_API_KEY=AIzaSyApmvl3E-sbQMZfadYGfa4P0EJ6N7IEZmo
FIREBASE_AUTH_DOMAIN=wad2-login-5799b.firebaseapp.com
FIREBASE_PROJECT_ID=wad2-login-5799b
FIREBASE_STORAGE_BUCKET=wad2-login-5799b.appspot.com
FIREBASE_MESSAGING_SENDER_ID=148986270821
FIREBASE_APP_ID=1:148986270821:web:fc17df5adf49b464a1628c
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:10000
```

**⚠️ Important**: Replace `your_stripe_secret_key` and `your_stripe_public_key` with your actual Stripe keys from https://dashboard.stripe.com/test/apikeys

## 3️⃣ Run the App (5 seconds)
```bash
npm start
```

## 4️⃣ Open Browser (5 seconds)
Go to: **http://localhost:10000**

---

## 🎉 That's It!

You should see the ChopeLah login page. You can now:
- Create an account or login
- Browse food centres
- Make seat reservations
- Order food online
- Test payments with card: `4242 4242 4242 4242`

---

## 🆘 Quick Troubleshooting

**Problem**: Server won't start
- **Fix**: Check if you have the `.env` file created with valid Stripe keys

**Problem**: Can't login
- **Fix**: Make sure your email format is valid and password meets requirements (8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character)

**Problem**: Payment doesn't work
- **Fix**: Make sure you added valid Stripe keys to `.env`

---

For detailed setup instructions, see **GETTING_STARTED.md**

