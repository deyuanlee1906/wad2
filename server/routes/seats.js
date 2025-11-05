/**
 * Seats Routes
 * API endpoints for seat availability and management
 */

const express = require('express');
const router = express.Router();
const { validateSeatData } = require('../db/queries/reservationsRepo');

/**
 * GET /api/seats/availability/:foodCentre
 * Get seat availability for a food centre
 */
router.get('/availability/:foodCentre', async (req, res) => {
  try {
    const { foodCentre } = req.params;

    if (!foodCentre) {
      return res.status(400).json({
        success: false,
        error: 'Food centre name required'
      });
    }

    // In a full implementation, this would query the database
    // For now, return validation success
    res.json({
      success: true,
      foodCentre: decodeURIComponent(foodCentre),
      message: 'Seat availability check passed (client-side data used)',
      note: 'Actual availability is managed on the client side via Firebase'
    });
  } catch (error) {
    console.error('Error fetching seat availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seat availability',
      details: error.message
    });
  }
});

/**
 * POST /api/seats/validate
 * Validate seat data structure
 */
router.post('/validate', (req, res) => {
  try {
    const seatData = req.body;

    if (!seatData) {
      return res.status(400).json({
        success: false,
        error: 'Seat data required'
      });
    }

    const validation = validateSeatData(seatData);

    if (validation.valid) {
      res.json({
        success: true,
        message: 'Seat data is valid'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid seat data',
        details: validation.errors
      });
    }
  } catch (error) {
    console.error('Error validating seat data:', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }
});

/**
 * GET /api/seats/health
 * Health check for seats service
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'seats',
    message: 'Seats service is running'
  });
});

module.exports = router;
