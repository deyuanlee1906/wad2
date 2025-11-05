const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes (before static files to ensure API routes are mounted first)
const paymentRoutes = require('./routes/payments');

// Mount API routes
app.use('/api', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Firebase config endpoint (serves config from environment variables)
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

// Stripe config endpoint (serves publishable key securely)
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

// Serve static files from src directory
// This MUST come before the catch-all route to serve JS, CSS, images, etc.
const staticPath = path.join(__dirname, '../src');

// Explicit handler for JS files to ensure proper MIME types and ES modules
app.get(/^\/(scripts|pages)\/.*\.js$/, (req, res, next) => {
  const filePath = path.join(staticPath, req.path);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.send(fileContent);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return res.status(500).send('Error reading file');
    }
  }
  
  next();
});

// Static file middleware
app.use(express.static(staticPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    }
  },
  index: false,
  dotfiles: 'ignore'
}));

// Handle POST requests to HTML routes (prevent errors from accidental form submissions)
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend available at http://localhost:${PORT}`);
  console.log(`💳 Payment API available at http://localhost:${PORT}/api`);
  console.log(`🔥 Firebase config available at http://localhost:${PORT}/api/firebase-config`);
  
  // Warn if required env vars are missing
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  WARNING: STRIPE_SECRET_KEY not set');
  }
  if (!process.env.FIREBASE_API_KEY) {
    console.warn('⚠️  WARNING: FIREBASE_API_KEY not set (using fallback values)');
  }
});