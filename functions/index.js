/**
 * Firebase Cloud Functions for Payment Processing
 * 
 * This file contains the createPaymentLink function with proper CORS handling
 * for http://localhost:10000 (development) and https://chopelah.onrender.com (production)
 * 
 * Uses Firebase Functions v2 API
 */

const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const admin = require("firebase-admin");
const stripe = require("stripe");
const cors = require("cors");

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
});

// Initialize Stripe with secret key
// Priority: Environment variable > Firebase config > Hardcoded fallback
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 
                       'sk_test_51SIrnNLffQP02jW1V41F9l5emSSV1VGmEr1cIUbOUn0PmjcfPGBWKAZbujNpunhaJyLPKGS77wXkiLb3kjdOcFJu00IREvpkbz';

const stripeClient = stripe(stripeSecretKey);

/**
 * Configure CORS middleware
 * This allows requests from localhost:10000 (development) and chopelah.onrender.com (production)
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from localhost:10000 (for local development)
    // and chopelah.onrender.com (for production)
    const allowedOrigins = [
      'http://localhost:10000',
      'https://localhost:10000',
      'https://chopelah.onrender.com',
      'http://chopelah.onrender.com',
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

/**
 * Helper function to wrap request handler with CORS
 * This properly handles preflight OPTIONS requests
 */
const corsHandler = cors(corsOptions);

/**
 * Create Payment Link Function
 * 
 * This function creates a Stripe Payment Link for the checkout process.
 * It handles CORS properly for http://localhost:10000
 * 
 * Uses Firebase Functions v2 API with onRequest
 * 
 * Request Body:
 * {
 *   "items": [
 *     {
 *       "name": "Food Item",
 *       "price": 10.50,
 *       "quantity": 2,
 *       "description": "Optional description",
 *       "image": "https://example.com/image.jpg"
 *     }
 *   ],
 *   "shippingFee": 0,
 *   "totalAmount": 21.00,
 *   "orderId": "ORD123456",
 *   "stallName": "Peanuts Soup",
 *   "foodCentre": "Maxwell Food Centre",
 *   "pickupOption": "Dine In",
 *   "pickupTime": "12:00PM",
 *   "successUrl": "https://your-domain.com/pages/order/orderconfirmed.html"
 * }
 * 
 * Response:
 * {
 *   "url": "https://buy.stripe.com/test_xxx",
 *   "paymentLinkId": "plink_xxx"
 * }
 */
exports.createPaymentLink = onRequest(
  {
    cors: true, // Enable CORS support
    maxInstances: 5,
  },
  async (req, res) => {
    // Handle CORS preflight requests (OPTIONS)
    // This is called automatically by the cors middleware
    corsHandler(req, res, async () => {
      // Set CORS headers manually as well (backup)
      // Allow requests from both localhost and production domain
      const origin = req.headers.origin;
      const allowedOrigins = [
        'http://localhost:10000',
        'https://localhost:10000',
        'https://chopelah.onrender.com',
        'http://chopelah.onrender.com',
      ];
      
      if (origin && allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
      } else {
        res.set('Access-Control-Allow-Origin', 'https://chopelah.onrender.com');
      }
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Access-Control-Allow-Credentials', 'true');

      // Handle preflight OPTIONS request
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      // Only allow POST requests for actual payment link creation
      if (req.method !== 'POST') {
        res.status(405).json({ 
          error: 'Method not allowed',
          message: 'Only POST requests are supported' 
        });
        return;
      }

      try {
        console.log('📦 Received payment link request:', {
          orderId: req.body?.orderId,
          totalAmount: req.body?.totalAmount,
          itemsCount: req.body?.items?.length,
        });

        // Validate request body
        if (!req.body || !req.body.items || !Array.isArray(req.body.items)) {
          res.status(400).json({
            error: 'Invalid request',
            message: 'Request body must include an "items" array'
          });
          return;
        }

        if (!req.body.totalAmount || req.body.totalAmount <= 0) {
          res.status(400).json({
            error: 'Invalid request',
            message: 'Request body must include a valid "totalAmount"'
          });
          return;
        }

        // Helper function to validate if a string is a valid absolute URL
        const isValidUrl = (string) => {
          if (!string || typeof string !== 'string') return false;
          try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch (_) {
            return false;
          }
        };

        // Helper function to convert relative image paths to absolute URLs
        // Uses production domain (chopelah.onrender.com) for absolute URLs
        const getAbsoluteImageUrl = (imagePath) => {
          if (!imagePath) return null;
          
          // If already an absolute URL, return as is
          if (isValidUrl(imagePath)) {
            return imagePath;
          }
          
          // If relative path (starts with /), convert to absolute URL
          if (imagePath.startsWith('/')) {
            // Use production domain for absolute URLs
            return `https://chopelah.onrender.com${imagePath}`;
          }
          
          // Invalid format, return null
          return null;
        };

        // Prepare line items for Stripe Payment Link
        const lineItems = req.body.items.map(item => {
          // Build product_data object - only include description if it exists and is not empty
          const productData = {
            name: item.name || 'Item',
          };
          
          // Only add description if it exists and is not empty (Stripe doesn't allow empty strings)
          if (item.description && item.description.trim() !== '') {
            productData.description = item.description;
          }
          
          // Convert image path to absolute URL if needed
          // Stripe requires absolute URLs for images
          const absoluteImageUrl = getAbsoluteImageUrl(item.image);
          if (absoluteImageUrl) {
            productData.images = [absoluteImageUrl];
          }
          // If no valid image URL, don't include images array (Stripe will use default)
          
          return {
            price_data: {
              currency: 'sgd',
              product_data: productData,
              unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
            },
            quantity: item.quantity || 1,
          };
        });

        // Add shipping fee if applicable
        if (req.body.shippingFee && req.body.shippingFee > 0) {
          lineItems.push({
            price_data: {
              currency: 'sgd',
              product_data: {
                name: 'Shipping Fee',
                description: 'Delivery or service charge',
              },
              unit_amount: Math.round(req.body.shippingFee * 100),
            },
            quantity: 1,
          });
        }

        // Prepare metadata for the payment link
        const metadata = {
          orderId: req.body.orderId || 'N/A',
          stallName: req.body.stallName || '',
          foodCentre: req.body.foodCentre || '',
          pickupOption: req.body.pickupOption || '',
          pickupTime: req.body.pickupTime || '',
        };

        // Create Stripe Payment Link
        const paymentLink = await stripeClient.paymentLinks.create({
          line_items: lineItems,
          metadata: metadata,
          after_completion: {
            type: 'redirect',
            redirect: {
              url: req.body.successUrl || 'https://example.com/success',
            },
          },
        });

        console.log('✅ Payment link created successfully:', {
          paymentLinkId: paymentLink.id,
          url: paymentLink.url,
        });

        // Return success response with CORS headers
        res.status(200).json({
          url: paymentLink.url,
          paymentLinkId: paymentLink.id,
          success: true,
        });

      } catch (error) {
        console.error('❌ Error creating payment link:', error);

        // Return error response with CORS headers
        res.status(500).json({
          error: 'Payment link creation failed',
          message: error.message || 'An unknown error occurred',
          success: false,
        });
      }
    });
  }
);
