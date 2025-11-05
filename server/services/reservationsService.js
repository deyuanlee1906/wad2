/**
 * Reservations Service
 * Business logic for seat reservations
 */

const {
  validateReservation,
  checkSeatAvailability,
  getReservationRules
} = require('../db/queries/reservationsRepo');

/**
 * Create a new reservation
 * Validates and processes reservation request
 * @param {Object} reservationData - Reservation details
 * @returns {Promise<Object>} - { success: boolean, data?: Object, error?: string }
 */
async function createReservation(reservationData) {
  try {
    // Validate reservation data
    const validation = validateReservation(reservationData);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Validation failed',
        details: validation.errors
      };
    }

    // Check seat availability
    const availability = await checkSeatAvailability(
      reservationData.foodCentre,
      reservationData.tableNumber,
      reservationData.seatNumber
    );

    if (!availability.available) {
      return {
        success: false,
        error: 'Seat not available',
        details: availability.reason
      };
    }

    // Apply business rules
    const rules = getReservationRules();
    const duration = reservationData.duration || rules.defaultDuration;

    if (duration > rules.maxDuration) {
      return {
        success: false,
        error: `Duration cannot exceed ${rules.maxDuration} minutes`
      };
    }

    if (duration < rules.minDuration) {
      return {
        success: false,
        error: `Duration must be at least ${rules.minDuration} minutes`
      };
    }

    // Return success with processed data
    // Note: Actual database insertion happens on client side for now
    return {
      success: true,
      data: {
        ...reservationData,
        duration,
        validatedAt: new Date().toISOString(),
        rules: {
          maxDuration: rules.maxDuration,
          cancellationWindow: rules.cancellationWindow
        }
      },
      message: 'Reservation validated successfully'
    };
  } catch (error) {
    console.error('Error creating reservation:', error);
    return {
      success: false,
      error: 'Internal server error',
      details: error.message
    };
  }
}

/**
 * Get reservation rules for client
 * @returns {Object} - Reservation rules
 */
function getReservationPolicies() {
  const rules = getReservationRules();
  return {
    duration: {
      min: rules.minDuration,
      max: rules.maxDuration,
      default: rules.defaultDuration,
      unit: 'minutes'
    },
    booking: {
      maxAdvanceDays: rules.maxAdvanceBooking,
      minAdvanceDays: rules.minAdvanceBooking
    },
    cancellation: {
      windowMinutes: rules.cancellationWindow,
      description: `Can cancel up to ${rules.cancellationWindow} minutes before reservation`
    },
    limits: {
      maxActiveReservations: rules.maxActiveReservations,
      description: `Maximum ${rules.maxActiveReservations} active reservations per user`
    }
  };
}

/**
 * Validate cancellation request
 * @param {Object} cancellationData - { reservationId, userId, reservationTime }
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateCancellation(cancellationData) {
  const rules = getReservationRules();
  
  if (!cancellationData.reservationId) {
    return { valid: false, error: 'Reservation ID required' };
  }

  if (!cancellationData.userId) {
    return { valid: false, error: 'User ID required' };
  }

  if (cancellationData.reservationTime) {
    const reservationTime = new Date(cancellationData.reservationTime);
    const now = new Date();
    const minutesUntilReservation = (reservationTime - now) / (1000 * 60);

    if (minutesUntilReservation < rules.cancellationWindow) {
      return {
        valid: false,
        error: `Cannot cancel within ${rules.cancellationWindow} minutes of reservation time`
      };
    }
  }

  return { valid: true };
}

module.exports = {
  createReservation,
  getReservationPolicies,
  validateCancellation
};
