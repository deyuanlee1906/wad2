// Booking History Management
class BookingHistory {
    constructor() {
        this.modal = null;
        this.initialized = false;
    }

    // initialize method
    initialize() {
        if (this.initialized) return;
        
        // Initialize history modal
        this.modal = new bootstrap.Modal(document.getElementById('historyModal'));
        document.getElementById('historyBtn').addEventListener('click', () => {
            this.updateActiveBookings();
            this.modal.show();
        });

        // Update bookings list every minute
        setInterval(() => this.updateActiveBookings(), 60000);
        
        this.initialized = true;
    }

    // get the foon center's name
    getFoodCenterName(code) {
        switch(code) {
            case 'maxwell': return 'Maxwell Food Centre';
            case 'newton': return 'Newton Food Centre';
            case 'changiVillage': return 'Changi Village Food Centre';
            default: return code;
        }
    }

    // calculate the remaining time of the booking
    formatTimeRemaining(expiresAt) {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;
        
        if (diff <= 0) return 'Expired';
        
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) {
            return `${minutes} minutes remaining`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m remaining`;
    }

    formatDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // handel the cancelation of booking
    cancelBooking(foodCenter, table, seat) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            try {
                if (!window.seatDatabase) {
                    throw new Error('Seat database not initialized');
                }
                const success = window.seatDatabase.releaseSeat(foodCenter, table, seat);
                if (success) {
                    alert('Booking cancelled successfully!');
                    this.updateActiveBookings(); // Refresh the booking list
                } else {
                    throw new Error('Failed to release seat');
                }
            } catch (e) {
                console.error('Error cancelling booking:', e);
                alert('Failed to cancel booking. Please try again.');
            }
        }
    }

    // update the active booking list which add or delete the booking history
    updateActiveBookings() {
        const container = document.getElementById('activeBookings');
        if (!container) {
            console.error('Bookings container not found');
            return;
        }

        container.innerHTML = ''; // Clear existing bookings
        
        let foundActiveBookings = false;
        if (!window.seatDatabase) {
            console.error('SeatDatabase not initialized');
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-exclamation-triangle-fill fs-1"></i>
                    <p class="mt-2">Error: Seat database not initialized</p>
                </div>
            `;
            return;
        }

        const now = new Date();

        // For debugging
        console.log('Current time:', now);
        console.log('Checking bookings in seatDatabase:', window.seatDatabase);
        
        try {
            const stored = localStorage.getItem('seatDatabase');
            console.log('Raw localStorage data:', stored);
        } catch (e) {
            console.error('Error reading localStorage:', e);
        }

        // Check all food centers
        ['maxwell', 'newton', 'changiVillage'].forEach(foodCenter => {
            const bookings = window.seatDatabase.getAllSeats(foodCenter);
            console.log(`Checking ${foodCenter}:`, bookings);
            
            for (const table in bookings) {
                for (const seat in bookings[table]) {
                    const booking = bookings[table][seat];
                    console.log(`Checking booking for ${foodCenter} table ${table} seat ${seat}:`, booking);
                    
                    // if there is booking and have not expired yet, then create the booking histroy card
                    if (booking.status === 'booked' && booking.expiresAt) {
                        const expiresAt = new Date(booking.expiresAt);
                        if (expiresAt > now) {
                            foundActiveBookings = true;
                            
                            // Create booking card
                            const card = document.createElement('div');
                            card.className = 'booking-card';
                            card.innerHTML = `
                                <div class="detail-item">
                                    <span class="detail-label">Food Center:</span>
                                    <span class="detail-value">${this.getFoodCenterName(foodCenter)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Table:</span>
                                    <span class="detail-value">${table}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Seat:</span>
                                    <span class="detail-value">${seat}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Booked At:</span>
                                    <span class="detail-value">${this.formatDateTime(booking.bookedAt)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Expires At:</span>
                                    <span class="detail-value">${this.formatDateTime(booking.expiresAt)}</span>
                                </div>
                                <div class="time-remaining">
                                    ${this.formatTimeRemaining(booking.expiresAt)}
                                </div>
                                <div class="text-center mt-3">
                                    <button class="btn custom-btn-danger btn-sm" 
                                            style="transition: background-color 0.3s ease;"
                                            onmouseover="this.style.backgroundColor='#dc3545'; this.style.borderColor='#dc3545'; this.style.color='white';"
                                            onmouseout="this.style.backgroundColor='transparent'; this.style.borderColor='var(--danger-color)'; this.style.color='var(--danger-color)';"
                                            onclick="bookingHistory.cancelBooking('${foodCenter}', ${table}, ${seat})">
                                        <i class="bi bi-x-circle me-2"></i>Cancel Booking
                                    </button>
                                </div>
                            `;
                            container.appendChild(card);
                        }
                    }
                }
            }
        });

        // if theres not booking history --> show no active booking
        if (!foundActiveBookings) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-calendar-x fs-1"></i>
                    <p class="mt-2">No active bookings found</p>
                </div>
            `;
        }
    }
}

// Create global instance
window.bookingHistory = new BookingHistory();