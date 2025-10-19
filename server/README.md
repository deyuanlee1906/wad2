# Server - Backend-for-Frontend (BFF) Layer

This directory contains the Backend-for-Frontend (BFF) API server implementation.

## Directory Structure

```
server/
├── index.js                    # Main server entry point (Express app setup)
├── routes/                     # HTTP endpoint handlers
│   ├── reservations.js        # Seat reservation endpoints
│   └── seats.js               # Seat availability endpoints
├── services/                   # Business logic layer
│   └── reservationsService.js # Reservation rules and validation
├── external/                   # External API integrations
│   ├── stripeClient.js        # Stripe payment API
│   └── visionClient.js        # Google Cloud Vision API
└── db/                        # Database layer
    ├── client.js              # Database connection setup
    └── queries/               # Database query functions
        └── reservationsRepo.js # Reservation CRUD operations

```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase credentials (for authentication)
- API keys for Stripe and Google Cloud Vision (if using)

### Installation

1. Install dependencies:
   ```bash
   npm install express cors dotenv firebase-admin
   ```

2. Create a `.env` file in the project root with your configuration:
   ```
   PORT=3000
   FIREBASE_PROJECT_ID=your-project-id
   STRIPE_API_KEY=your-stripe-key
   GOOGLE_CLOUD_VISION_KEY=your-vision-key
   DATABASE_URL=your-database-url
   ```

### Implementation Guide

#### 1. Server Setup (index.js)

Set up Express server with middleware:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Import and mount routes
const reservationsRoutes = require('./routes/reservations');
const seatsRoutes = require('./routes/seats');

app.use('/api/reservations', reservationsRoutes);
app.use('/api/seats', seatsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 2. Routes

Define HTTP endpoints and map them to service functions.

#### 3. Services

Implement business logic such as:
- Seat reservation validation
- Time slot availability checks
- Reservation duration limits
- Conflict detection

#### 4. Database

Choose and implement either:
- **Firebase Firestore** (NoSQL, good for rapid development)
- **PostgreSQL** (SQL, good for complex queries)
- Both (hybrid approach)

#### 5. External APIs

Integrate external services:
- **Stripe**: Payment processing
- **Google Cloud Vision**: Image analysis for food photos

## Architecture Layers

This BFF follows a 4-layer architecture:

1. **Client Layer** (Frontend) → Sends requests with Firebase auth tokens
2. **BFF Layer** (This server) → Validates tokens, applies business logic
3. **External Services** → Stripe, Google Cloud Vision APIs
4. **Database Layer** → Stores application data

## Authentication Flow

1. User logs in via Firebase on the client
2. Client receives Firebase auth token
3. Client includes token in API requests
4. BFF validates token with Firebase Admin SDK
5. BFF processes request if token is valid

## Next Steps

1. Implement `index.js` with Express server setup
2. Set up Firebase Admin SDK for token verification
3. Implement route handlers in `routes/`
4. Add business logic in `services/`
5. Set up database connection in `db/client.js`
6. Implement database queries in `db/queries/`
7. Test endpoints with Postman or similar tool

## Notes

- All files currently contain TODOs and placeholder code
- Follow the existing project structure in the `src/` directory for consistency
- Refer to `docs/ARCHITECTURE.md` for detailed architecture documentation
- Use environment variables for sensitive data (API keys, credentials)

