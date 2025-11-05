/**
 * Reservations Routes
 * API endpoints for seat reservations
 */

const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservationPolicies,
  validateCancellation
} = require('../services/reservationsService');

/**
 * GET /api/reservations/policies
 * Get reservation policies and rules
 */
router.get('/policies', (req, res) => {
  try {
    const policies = getReservationPolicies();
    res.json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservation policies'
    });
  }
});

/**
 * POST /api/reservations/validate
 * Validate reservation data before client-side submission
 */
router.post('/validate', async (req, res) => {
  try {
    const reservationData = req.body;

    if (!reservationData) {
      return res.status(400).json({
        success: false,
        error: 'Reservation data required'
      });
    }

    const result = await createReservation(reservationData);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error validating reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }
});

/**
 * POST /api/reservations/validate-cancellation
 * Validate cancellation request
 */
router.post('/validate-cancellation', (req, res) => {
  try {
    const cancellationData = req.body;

    if (!cancellationData) {
      return res.status(400).json({
        success: false,
        error: 'Cancellation data required'
      });
    }

    const validation = validateCancellation(cancellationData);

    if (validation.valid) {
      res.json({
        success: true,
        message: 'Cancellation allowed'
      });
    } else {
      res.status(400).json({
        success: false,
        error: validation.error
      });
    }
  } catch (error) {
    console.error('Error validating cancellation:', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }
});

/**
 * GET /api/reservations/health
 * Health check for reservations service
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'reservations',
    message: 'Reservations service is running'
  });
});

module.exports = router;
