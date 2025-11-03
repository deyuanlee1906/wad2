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
const fs = require('fs');

// Explicit handler for JS files FIRST to prevent any transformation/bundling
// This runs before express.static to ensure raw files are served
// Use regex to match any .js file in scripts or pages directories
app.get(/^\/(scripts|pages)\/.*\.js$/, (req, res, next) => {
  const filePath = path.join(staticPath, req.path);
  
  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    try {
      // Read file directly to ensure we're serving the raw source
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Verify it's not already transformed (should not contain exports.__esModule)
      if (fileContent.includes('exports.__esModule') || fileContent.includes('Object.defineProperty(exports')) {
        console.error(`WARNING: ${req.path} appears to be transformed. This should not happen.`);
        console.error(`File path: ${filePath}`);
      }
      
      // Set proper headers for ES modules
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // Force no cache to prevent stale transformed versions
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Send file content directly
      return res.send(fileContent);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return res.status(500).send('Error reading file');
    }
  }
  
  // File doesn't exist, pass to next middleware
  next();
});

app.use(express.static(staticPath, {
  // Ensure proper MIME types for JavaScript modules
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // No cache for JS files to prevent stale versions
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
  // Don't serve index.html for directory requests - let our route handle it
  index: false,
  // Don't compress/transform files
  dotfiles: 'ignore',
  etag: false, // Disable etag to prevent cache issues
  lastModified: false // Disable lastModified to prevent cache issues
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

// Catch-all for SPA routing
// Note: express.static above will have already served any existing files
// This only runs if express.static didn't find the file (called next())
app.get('*', (req, res) => {
  // Check if this is a request for a file with an extension
  const staticExtensions = ['.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.json'];
  if (staticExtensions.some(ext => req.path.endsWith(ext))) {
    // Static file was requested but not found - return 404
    return res.status(404).send('File not found');
  }
  
  // For HTML files, try to serve them directly (fallback if static middleware missed them)
  // For other routes without extensions, serve index.html for SPA routing
  const fs = require('fs');
  const requestedPath = path.join(__dirname, '../src', req.path);
  
  // If the path exists and is a file, serve it
  if (fs.existsSync(requestedPath)) {
    const stats = fs.statSync(requestedPath);
    if (stats.isFile()) {
      return res.sendFile(requestedPath);
    }
    // If it's a directory, try index.html in that directory
    if (stats.isDirectory()) {
      const indexInDir = path.join(requestedPath, 'index.html');
      if (fs.existsSync(indexInDir)) {
        return res.sendFile(indexInDir);
      }
    }
  }
  
  // If path ends with .html but file doesn't exist, return 404
  if (req.path.endsWith('.html')) {
    return res.status(404).send('File not found');
  }
  
  // Otherwise, it's an SPA route without extension - serve index.html
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

// Export as Vercel serverless function
module.exports = app;

