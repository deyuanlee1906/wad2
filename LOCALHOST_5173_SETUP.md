# 🚀 Localhost:5173 Setup Guide

## ✅ **What's Been Set Up:**

1. ✅ **Express Server** - Payment API on port 10000
2. ✅ **CORS Updated** - Allows requests from localhost:5173
3. ✅ **Payment Intent Endpoint** - `/api/create-payment-intent` added
4. ✅ **Checkout Page** - Automatically detects localhost:5173 and uses Express API

---

## 🏃 **How to Run:**

### **Step 1: Start Express Server (Port 10000)**
```bash
cd /Applications/MAMP/htdocs/wad2
npm run server
```

You should see:
```
🚀 Server running on port 10000
📱 Frontend available at http://localhost:10000
💳 Payment API available at http://localhost:10000/api
```

### **Step 2: Start Dev Server (Port 5173)**
Open a **new terminal** and run:
```bash
cd /Applications/MAMP/htdocs/wad2
npm run dev
```

You should see:
```
Serving!
   http://localhost:5173
```

### **Step 3: Open Your App**
Go to: **http://localhost:5173/pages/order/online-order-home.html**

---

## 🔄 **How It Works:**

### **When Running on localhost:5173:**
- Frontend: `http://localhost:5173` (npm run dev)
- API: `http://localhost:10000/api` (npm run server)
- Checkout automatically calls: `http://localhost:10000/api/create-payment-intent`

### **Payment Flow:**
1. User on `localhost:5173` clicks "Complete Payment"
2. Checkout detects it's on port 5173
3. Calls Express API on `localhost:10000/api/create-payment-intent`
4. Express server creates Stripe Payment Intent
5. Returns `clientSecret`
6. Order saved and redirects to success page

---

## 📋 **API Endpoint:**

### **Create Payment Intent**
```
POST http://localhost:10000/api/create-payment-intent

Headers:
Content-Type: application/json

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

---

## ✅ **Test It:**

1. **Start both servers:**
   ```bash
   # Terminal 1
   npm run server
   
   # Terminal 2
   npm run dev
   ```

2. **Open app:**
   - Go to `http://localhost:5173`
   - Navigate to checkout
   - Select Stripe payment
   - Click "Complete Payment"

3. **Check console:**
   - Should see: "💳 Creating Payment Intent via API..."
   - Should see: "📍 API URL: http://localhost:10000"
   - Should see: "✅ Payment Intent created"

---

## 🔍 **Verify Server is Running:**

### **Health Check:**
Open in browser: `http://localhost:10000/api/health`

Should return:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "..."
}
```

### **Test Payment Intent:**
Open browser console and run:
```javascript
fetch('http://localhost:10000/api/create-payment-intent', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    amount: 10.00,
    currency: 'sgd',
    order: {id: 'test_123'}
  })
})
.then(r => r.json())
.then(console.log);
```

---

## ⚠️ **Important Notes:**

1. **Both servers needed:**
   - Port 5173: Frontend (npm run dev)
   - Port 10000: API (npm run server)

2. **CORS enabled:**
   - Express server allows requests from localhost:5173

3. **Stripe keys:**
   - Publishable key: In checkout.html
   - Secret key: In `.env` file or server

4. **No Firebase Functions needed:**
   - Uses local Express server instead

---

## 🎯 **Quick Start:**

```bash
# Terminal 1 - API Server
npm run server

# Terminal 2 - Dev Server  
npm run dev

# Then open: http://localhost:5173
```

**Your checkout now works with localhost:5173!** 🎉
