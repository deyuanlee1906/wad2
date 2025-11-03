const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from src directory
app.use(express.static(path.join(__dirname, '../src')));

// Import routes
const paymentRoutes = require('../server/routes/payments');

// Mount routes
app.use('/api', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve static files - catch-all for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

// Export as Vercel serverless function
module.exports = app;

