const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ============================================
// CORS Configuration
// ============================================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:10000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Use CORS middleware
app.use(cors(corsOptions));

// ============================================
// Body Parser Middleware
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Request Logging Middleware
// ============================================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// Database Initialization
// ============================================
const { initializeDatabase } = require('./db/client');
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

// ============================================
// Import Routes
// ============================================
const paymentRoutes = require('./routes/payments');
const reservationRoutes = require('./routes/reservations');
const seatsRoutes = require('./routes/seats');

// ============================================
// Mount API Routes (before static files)
// ============================================
app.use('/api/payments', paymentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/seats', seatsRoutes);

// Also mount payments at /api root for backward compatibility
app.use('/api', paymentRoutes);

// ============================================
// Health Check Endpoint
// ============================================
app.get('/api/health', async (req, res) => {
  const { checkDatabaseHealth } = require('./db/client');
  const { getVisionApiStatus } = require('./external/visionClient');
  
  try {
    const dbHealth = await checkDatabaseHealth();
    const visionStatus = getVisionApiStatus();
    
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealth,
        vision: visionStatus,
        stripe: {
          configured: !!process.env.STRIPE_SECRET_KEY,
          message: process.env.STRIPE_SECRET_KEY ? 'Stripe configured' : 'Stripe not configured'
        }
      },
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// ============================================
// Firebase Config Endpoint
// ============================================
app.get('/api/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'wad2-login-5799b.firebaseapp.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'wad2-login-5799b',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'wad2-login-5799b.appspot.com',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '148986270821',
    appId: process.env.FIREBASE_APP_ID || '1:148986270821:web:fc17df5adf49b464a1628c'
  });
});

// ============================================
// Stripe Config Endpoint
// ============================================
app.get('/api/stripe-config', (req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.warn('⚠️  STRIPE_PUBLISHABLE_KEY not set in environment variables');
    return res.status(500).json({ 
      error: 'Stripe publishable key not configured',
      message: 'Please set STRIPE_PUBLISHABLE_KEY in your .env file'
    });
  }
  
  res.json({
    publishableKey: publishableKey
  });
});

// ============================================
// Static Files Configuration
// ============================================
const staticPath = path.join(__dirname, '../src');

// Explicit handler for JS files with proper caching
app.get(/^\/(scripts|pages)\/.*\.js$/, (req, res, next) => {
  const filePath = path.join(staticPath, req.path);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Set proper headers for ES modules with consistent caching
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Use short cache for development, longer for production
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
      } else {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
      
      return res.send(fileContent);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return res.status(500).send('Error reading file');
    }
  }
  
  next();
});

// Static file middleware with consistent caching
app.use(express.static(staticPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Consistent caching strategy
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
      } else {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
    }
  },
  index: false,
  dotfiles: 'ignore'
}));

// ============================================
// SPA Routing Handlers
// ============================================

// Handle POST requests to HTML routes
app.post('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  const staticExtensions = ['.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.json'];
  if (staticExtensions.some(ext => req.path.endsWith(ext))) {
    return res.status(405).send('Method Not Allowed');
  }
  
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Catch-all for SPA routing
app.get('*', (req, res) => {
  const staticExtensions = ['.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.json'];
  
  if (staticExtensions.some(ext => req.path.endsWith(ext))) {
    return res.status(404).send('File not found');
  }
  
  const requestedPath = path.join(staticPath, req.path);
  
  if (fs.existsSync(requestedPath)) {
    const stats = fs.statSync(requestedPath);
    if (stats.isFile()) {
      return res.sendFile(requestedPath);
    }
    if (stats.isDirectory()) {
      const indexInDir = path.join(requestedPath, 'index.html');
      if (fs.existsSync(indexInDir)) {
        return res.sendFile(indexInDir);
      }
    }
  }
  
  if (req.path.endsWith('.html')) {
    return res.status(404).send('File not found');
  }
  
  // SPA route - serve index.html
  res.sendFile(path.join(staticPath, 'index.html'));
});

// ============================================
// Global Error Handler (must be last)
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err);
  
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details || []
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 ChopeLah Server Started');
  console.log('='.repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Payment API: http://localhost:${PORT}/api/payments`);
  console.log(`🪑 Seats API: http://localhost:${PORT}/api/seats`);
  console.log(`📅 Reservations API: http://localhost:${PORT}/api/reservations`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔥 Firebase Config: http://localhost:${PORT}/api/firebase-config`);
  console.log('='.repeat(50));
  
  // Environment variable warnings
  const warnings = [];
  if (!process.env.STRIPE_SECRET_KEY) warnings.push('STRIPE_SECRET_KEY not set');
  if (!process.env.STRIPE_PUBLISHABLE_KEY) warnings.push('STRIPE_PUBLISHABLE_KEY not set');
  if (!process.env.FIREBASE_API_KEY) warnings.push('FIREBASE_API_KEY not set (using fallback)');
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log('='.repeat(50));
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
