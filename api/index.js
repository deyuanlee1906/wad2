const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes (before static files to ensure API routes are mounted first)
const paymentRoutes = require('../server/routes/payments');
app.use('/api', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve static files from src directory
// This MUST come before the catch-all route to serve JS, CSS, images, etc.
// Express static middleware will handle requests for files that exist,
// and pass through to next middleware if file doesn't exist
const staticPath = path.join(__dirname, '../src');

app.use(express.static(staticPath, {
  // Ensure proper MIME types for JavaScript modules
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  },
  // Don't serve index.html for directory requests - let our route handle it
  index: false
}));

// Handle POST requests to HTML routes (prevent errors from accidental form submissions)
app.post('*', (req, res, next) => {
  // Skip POST for API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Skip POST for static file requests (shouldn't happen, but just in case)
  const staticExtensions = ['.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.json'];
  if (staticExtensions.some(ext => req.path.endsWith(ext))) {
    return res.status(405).send('Method Not Allowed');
  }
  
  // For POST to HTML routes, serve index.html
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

// Catch-all for SPA routing - ONLY matches if static middleware didn't find a file
app.get('*', (req, res) => {
  // If it's a request for a static file that wasn't found, return 404
  const staticExtensions = ['.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.json'];
  if (staticExtensions.some(ext => req.path.endsWith(ext))) {
    return res.status(404).send('File not found');
  }
  
  // Otherwise, it's an SPA route - serve index.html
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

// Export as Vercel serverless function
module.exports = app;

