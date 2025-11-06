# Hosting Architecture Breakdown
**Purpose:** Use this document to help ChatGPT or other AI assistants recommend the best hosting platform for your application.

---

## 📋 Application Overview

**Project Name:** ChopeLah  
**Type:** Full-stack web application (Food center seat reservation and ordering system)  
**Deployment Status:** Currently needs hosting platform decision

---

## 🏗️ Frontend Architecture

### **Technology Stack:**
- **Framework:** Vanilla HTML/CSS/JavaScript (no build step required)
- **Module System:** ES6 Modules (uses `type="module"` in HTML)
- **File Structure:**
  ```
  src/
  ├── index.html (main entry point)
  ├── pages/ (multiple HTML pages)
  ├── scripts/ (vanilla JS files, ES modules)
  ├── styles/ (CSS files)
  └── img/ (static images - 120+ food images, stall images)
  ```

### **Frontend Features:**
- Single Page Application (SPA) with multiple HTML pages
- Client-side routing handled by Express catch-all route
- No build process needed (serves raw HTML/CSS/JS files)
- Static asset serving (images, CSS, JS files)

### **External Frontend Dependencies:**
- **Firebase SDK (CDN):** Authentication and Firestore database
  - Loaded from: `https://www.gstatic.com/firebasejs/12.4.0/`
  - Used for: User authentication, user profiles, posts, likes
- **Font Awesome (CDN):** Icons
- **No npm packages required for frontend**

### **Frontend Requirements:**
- ✅ Must serve static files (HTML, CSS, JS, images)
- ✅ Must handle SPA routing (catch-all route serves index.html)
- ✅ No compilation/transpilation needed
- ✅ Must support ES6 modules
- ✅ Must serve ~120+ static image files efficiently

---

## 🔧 Backend Architecture

### **Technology Stack:**
- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Language:** JavaScript (CommonJS modules)

### **Backend Structure:**
```
server/
├── index.js (local development server entry point)
├── routes/
│   ├── payments.js (Stripe payment processing)
│   ├── reservations.js (seat reservations)
│   └── seats.js (seat management)
├── services/
│   └── reservationsService.js (business logic)
├── db/
│   └── queries/
│       └── reservationsRepo.js (database queries)
└── external/
    ├── stripeClient.js (Stripe API client)
    └── visionClient.js (Google Cloud Vision - placeholder)
```

### **API Endpoints:**

#### **Payment Routes (`/api`):**
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/confirm-payment` - Confirm payment
- `GET /api/payment-intent/:id` - Get payment details
- `POST /api/webhook` - Stripe webhook handler

#### **Other Routes:**
- `GET /api/health` - Health check endpoint

### **Backend Features:**
- **Static File Serving:** Serves entire `src/` directory
- **SPA Support:** Catch-all route for client-side routing
- **CORS Enabled:** Cross-origin requests allowed
- **JSON Body Parsing:** For API requests
- **Environment Variables:** Uses `dotenv` for configuration

### **Backend Dependencies (package.json):**
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "stripe": "^14.7.0"
}
```

### **Backend Requirements:**
- ✅ Node.js runtime (latest LTS or recent version)
- ✅ Express.js framework support
- ✅ Environment variable support (`.env` file or platform variables)
- ✅ Static file serving capability
- ✅ HTTP/HTTPS support
- ✅ Ability to handle POST requests (for payments, webhooks)
- ✅ Webhook support (Stripe requires publicly accessible URL)

---

## 🔌 External Services Integration

### **1. Firebase (Frontend Integration)**
- **Service:** Firebase Authentication + Firestore
- **Integration:** Client-side (browser), via CDN
- **Features Used:**
  - Email/Password authentication
  - Google OAuth
  - Facebook OAuth
  - Firestore database (user profiles, posts, likes)
- **Configuration:** Firebase config embedded in frontend code
- **Domain Requirements:** Must whitelist hosting domain in Firebase Console

### **2. Stripe (Backend Integration)**
- **Service:** Payment processing
- **Integration:** Server-side via Node.js SDK
- **Features Used:**
  - Payment Intent creation
  - Payment confirmation
  - Webhook handling
- **Requirements:**
  - HTTPS required
  - Public webhook endpoint (`/api/webhook`)
  - Environment variable: `STRIPE_SECRET_KEY`
- **API Type:** RESTful API calls from backend

### **3. Google Cloud Vision API (Planned)**
- **Service:** Image analysis
- **Status:** Placeholder file exists, not yet implemented
- **Future Requirement:** API key configuration

---

## 💾 Database Architecture

### **Current Database:**
- **Firebase Firestore** (NoSQL)
  - Used via client-side SDK
  - Stores: User profiles, posts, likes, community data
  - Access: Direct client access (not through backend)

### **Planned/Reserved:**
- **PostgreSQL** (SQL) - Placeholder files exist but not implemented
- **Potential Use:** Seat reservations, order records, structured data

### **Database Requirements:**
- ✅ Current: No backend database connection needed (Firebase is client-side)
- ✅ Future: May need PostgreSQL connection if backend database is added
- ✅ Current: Backend is stateless (no persistent connections needed)

---

## 📦 Build & Deployment Process

### **Current Build Process:**
- **Frontend:** None (no build step, serves raw files)
- **Backend:** None (Node.js, no compilation needed)
- **Dependencies:** `npm install` only
- **Deployment Files:** 
  - Source files directly served
  - No bundling/transpilation required

### **Environment Variables Required:**
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `PORT` - Server port (optional, defaults to 3000)
- Future: Google Cloud Vision API keys

### **Deployment Requirements:**
- ✅ Simple file deployment (no build pipeline needed)
- ✅ Node.js runtime installation
- ✅ npm install during deployment
- ✅ Environment variable configuration
- ✅ Static file serving from `src/` directory
- ✅ Root path handling (serves `src/index.html` for SPA)

---

## 🔒 Security & Configuration

### **Security Considerations:**
- **HTTPS Required:** For Stripe webhooks and OAuth
- **CORS:** Enabled for cross-origin requests
- **Environment Variables:** Sensitive keys stored in env vars
- **Firebase:** Client-side keys are public (this is normal for Firebase)

### **Configuration Files:**
- `.env` file for local development
- Platform environment variables for production
- `package.json` for dependencies

---

## 🌐 Network & Routing Requirements

### **Routing Strategy:**
- **API Routes:** `/api/*` → Express backend routes
- **Static Files:** Direct file serving (JS, CSS, images)
- **SPA Routes:** Catch-all `*` → Serves `index.html`

### **Special Routing Needs:**
- Express serves both API and static files from same server
- Must handle deep linking (SPA routes like `/pages/order/stall.html`)
- Must serve files without extensions properly

---

## 📊 Performance Characteristics

### **Static Assets:**
- **Image Count:** 120+ images (food photos, stall photos)
- **File Types:** JPG, PNG, SVG
- **Total Size:** Unknown (need to check)
- **Serving:** Via Express static middleware

### **API Endpoints:**
- **Frequency:** Payment endpoints (moderate traffic expected)
- **Webhooks:** Stripe webhooks (external trigger)
- **Response Type:** JSON API responses

### **Scalability Needs:**
- Unknown traffic expectations
- Can start with single server/function
- May need horizontal scaling later

---

## 🎯 Hosting Platform Requirements Summary

### **Must Have:**
1. ✅ Node.js runtime support
2. ✅ Express.js framework support
3. ✅ Static file serving (HTML, CSS, JS, images)
4. ✅ HTTPS support (required for Stripe)
5. ✅ Environment variable configuration
6. ✅ Public URL for webhooks
7. ✅ SPA routing support (catch-all routes)
8. ✅ ES6 module support (client-side)
9. ✅ CORS capability

### **Nice to Have:**
- Auto-scaling
- CDN for static assets
- Easy environment variable management
- CI/CD integration
- SSL certificate auto-renewal
- Deployment from Git
- Preview deployments

### **Not Required:**
- Build pipeline/compilation
- Docker containers
- Kubernetes
- Serverless functions (though can work)
- Database hosting (using Firebase)
- Load balancer (can start simple)

---

## 🔍 Key Questions for Hosting Platform Selection

1. **Deployment Model:**
   - Traditional server (always-on) vs Serverless functions?
   - File upload vs Git-based deployment?

2. **Scaling:**
   - Expected traffic volume?
   - Need for auto-scaling?

3. **Budget:**
   - Free tier available?
   - Cost per request/server hour?

4. **Static Assets:**
   - CDN included for images?
   - Caching strategy?

5. **Regional Requirements:**
   - Need specific geographic region?
   - Latency requirements?

6. **Future Needs:**
   - Database hosting if moving away from Firebase?
   - Container support for future migration?

---

## 📝 Recommended Platforms to Evaluate

### **Traditional Server Hosting:**
- **Railway** - Simple Node.js hosting, Git-based
- **Render** - Easy Express.js deployment
- **DigitalOcean App Platform** - Managed app hosting
- **Heroku** - Classic PaaS (though pricing changed)

### **Serverless/Function Hosting:**
- **Netlify Functions** - Can host Express via serverless functions
- **AWS Lambda + API Gateway** - Enterprise scale
- **Google Cloud Run** - Container-based, serverless
- **Azure App Service** - Flexible hosting

### **VPS/Cloud Servers:**
- **DigitalOcean Droplets** - Full control, manual setup
- **Linode** - Similar to DigitalOcean
- **AWS EC2** - Scalable but more complex

### **Static + API Separation:**
- **Netlify (static) + Netlify Functions** - Good for static site + API
- **Vercel (static) + Vercel Functions** - Similar approach
- **Cloudflare Pages + Workers** - Edge computing

---

## 🚀 Quick Start Commands

### **Local Development:**
```bash
# Install dependencies
npm install

# Run local server
npm run server
# OR
node server/index.js

# Frontend only (dev mode)
npm run dev
```

### **Production Deployment:**
```bash
# Set environment variables
STRIPE_SECRET_KEY=sk_live_...
PORT=3000

# Start server
npm start
# OR
node server/index.js
```

---

## 📄 File Structure Summary

```
project/
├── api/              # Vercel serverless entry (can be removed or repurposed)
├── server/           # Backend Express server (main backend)
├── src/              # Frontend static files (HTML, CSS, JS, images)
├── package.json      # Dependencies
└── .env              # Environment variables (not in git)
```

**Key Entry Points:**
- **Production Backend:** `server/index.js` (Express server)
- **Alternative:** `api/index.js` (was for Vercel, can be removed or kept)
- **Frontend:** `src/index.html` (main HTML entry)

---

## ⚠️ Migration Notes

### **Currently Configured For:**
- Vercel (removed)
- Single Express server serving both API and static files

### **Migration Steps:**
1. Choose hosting platform based on above requirements
2. Update deployment configuration
3. Set environment variables on platform
4. Update Firebase authorized domains
5. Update Stripe webhook URL
6. Test all endpoints

---

**Last Updated:** After Vercel removal  
**Use This Document:** Copy and paste to ChatGPT with prompt: "Based on this architecture breakdown, recommend the best hosting platform for my application, considering ease of setup, cost, and scalability."

