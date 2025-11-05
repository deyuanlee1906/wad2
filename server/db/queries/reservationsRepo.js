/**
 * Reservations Repository
 * Database queries for reservation operations
 * 
 * Note: Currently, all Firebase operations happen on the client side.
 * This file provides server-side validation and business logic.
 */

/**
 * Validate reservation data
 * @param {Object} reservationData - Reservation data to validate
 * @returns {Object} - { valid: boolean, errors: Array }
 */
function validateReservation(reservationData) {
  const errors = [];
  
  if (!reservationData.userId || typeof reservationData.userId !== 'string') {
    errors.push('Valid userId is required');
  }
  
  if (!reservationData.foodCentre || typeof reservationData.foodCentre !== 'string') {
    errors.push('Valid foodCentre is required');
  }
  
  if (typeof reservationData.tableNumber !== 'number' || reservationData.tableNumber < 1) {
    errors.push('Valid tableNumber is required');
  }
  
  if (typeof reservationData.seatNumber !== 'number' || reservationData.seatNumber < 1) {
    errors.push('Valid seatNumber is required');
  }
  
  if (reservationData.duration && (typeof reservationData.duration !== 'number' || reservationData.duration < 1)) {
    errors.push('Duration must be a positive number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate seat availability data
 * @param {Object} seatData - Seat data to validate
 * @returns {Object} - { valid: boolean, errors: Array }
 */
function validateSeatData(seatData) {
  const errors = [];
  
  if (!seatData.foodCentre || typeof seatData.foodCentre !== 'string') {
    errors.push('Valid foodCentre is required');
  }
  
  if (typeof seatData.tableNumber !== 'number') {
    errors.push('Valid tableNumber is required');
  }
  
  if (!Array.isArray(seatData.seats)) {
    errors.push('Seats must be an array');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a seat is available
 * This is a server-side validation helper
 * @param {string} foodCentre - Food centre name
 * @param {number} tableNumber - Table number
 * @param {number} seatNumber - Seat number
 * @returns {Promise<Object>} - { available: boolean, reason: string }
 */
async function checkSeatAvailability(foodCentre, tableNumber, seatNumber) {
  try {
    // In a full implementation, this would query the database
    // For now, we'll return a basic validation
    
    if (!foodCentre || !tableNumber || !seatNumber) {
      return {
        available: false,
        reason: 'Invalid seat parameters'
      };
    }
    
    // Basic validation passed
    return {
      available: true,
      reason: 'Seat validation passed (client-side check required)'
    };
  } catch (error) {
    console.error('Error checking seat availability:', error);
    return {
      available: false,
      reason: 'Error checking availability'
    };
  }
}

/**
 * Get reservation business rules
 * @returns {Object} - Reservation rules
 */
function getReservationRules() {
  return {
    maxDuration: 120, // minutes
    minDuration: 30, // minutes
    defaultDuration: 60, // minutes
    maxAdvanceBooking: 7, // days
    minAdvanceBooking: 0, // days (can book immediately)
    cancellationWindow: 15, // minutes before reservation time
    maxActiveReservations: 3 // per user
  };
}

module.exports = {
  validateReservation,
  validateSeatData,
  checkSeatAvailability,
  getReservationRules
};
