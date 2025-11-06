// Booking History Management
class BookingHistory {
    constructor() {
        this.modal = null;
        this.initialized = false;
    }

    // initialize method
    initialize() {
        if (this.initialized) return;
        
        // Initialize desktop history modal
        const desktopModalEl = document.getElementById('historyModal');
        if (desktopModalEl) {
            this.modal = new bootstrap.Modal(desktopModalEl);
            const desktopBtn = document.getElementById('historyBtn');
            if (desktopBtn) {
                desktopBtn.addEventListener('click', () => {
                    this.updateActiveBookings();
                    this.modal.show();
                });
            }
        }

        // Initialize mobile history modal
        const mobileModalEl = document.getElementById('historyModalMobile');
        if (mobileModalEl) {
            this.mobileModal = new bootstrap.Modal(mobileModalEl);
            const mobileBtn = document.getElementById('historyBtnMobile');
            if (mobileBtn) {
                mobileBtn.addEventListener('click', () => {
                    this.updateActiveBookings();
                    this.mobileModal.show();
                });
            }
        }

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

    // Parse timeslot string (e.g., "8:00 AM") and return Date object for today
    parseTimeslot(timeslotStr) {
        if (!timeslotStr) return null;
        
        const today = new Date();
        const [time, period] = timeslotStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour24, minutes, 0);
        return date;
    }

    // Parse duration string (e.g., "30 mins" or "1 hour") and return minutes
    parseDuration(durationStr) {
        if (!durationStr) return 0;
        
        if (typeof durationStr === 'number') {
            return durationStr;
        }
        
        if (typeof durationStr === 'string') {
            if (durationStr.includes('hour')) {
                const hours = parseInt(durationStr);
                return hours * 60;
            } else if (durationStr.includes('mins') || durationStr.includes('min')) {
                return parseInt(durationStr);
            } else {
                // Try to parse as number
                const num = parseInt(durationStr);
                return isNaN(num) ? 0 : num;
            }
        }
        
        return 0;
    }

    // Calculate expiresAt from timeslot + duration
    calculateExpiresAt(timeslot, duration) {
        if (!timeslot) return null;
        
        const timeslotDate = this.parseTimeslot(timeslot);
        if (!timeslotDate) return null;
        
        const durationMinutes = this.parseDuration(duration);
        const expiresAt = new Date(timeslotDate.getTime() + durationMinutes * 60000);
        
        return expiresAt;
    }

    // Format time for display (e.g., "8:30 AM")
    formatTime(date) {
        if (!date) return '';
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Get current user ID
    getCurrentUserId() {
        return localStorage.getItem('loggedInUserId');
    }

    // handel the cancelation of booking
    async cancelBooking(foodCenter, table, seat) {
        // Verify the booking belongs to the current user before allowing cancellation
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId) {
            alert('You must be logged in to cancel bookings.');
            return;
        }

        // Wait for Firebase to be ready
        if (window.seatDatabase && window.seatDatabase.initPromise) {
            await window.seatDatabase.initPromise;
        }

        // Check if the booking belongs to the current user
        const bookings = window.seatDatabase.getAllSeats(foodCenter);
        if (bookings[table] && bookings[table][seat]) {
            const booking = bookings[table][seat];
            if (booking.bookedBy !== currentUserId) {
                alert('You can only cancel your own bookings.');
                return;
            }
        }

        if (confirm('Are you sure you want to cancel this booking?')) {
            try {
                if (!window.seatDatabase) {
                    throw new Error('Seat database not initialized');
                }
                const success = await window.seatDatabase.releaseSeat(foodCenter, table, seat);
                if (success) {
                    alert('Booking cancelled successfully!');
                    await this.updateActiveBookings(); // Refresh the booking list
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
    async updateActiveBookings() {
        // Update both desktop and mobile containers
        const desktopContainer = document.getElementById('activeBookings');
        const mobileContainer = document.getElementById('activeBookingsMobile');
        
        if (!desktopContainer && !mobileContainer) {
            console.error('Bookings containers not found');
            return;
        }

        if (!window.seatDatabase) {
            console.error('SeatDatabase not initialized');
            const errorHtml = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-exclamation-triangle-fill fs-1"></i>
                    <p class="mt-2">Error: Seat database not initialized</p>
                </div>
            `;
            if (desktopContainer) desktopContainer.innerHTML = errorHtml;
            if (mobileContainer) mobileContainer.innerHTML = errorHtml;
            return;
        }

        // Wait for Firebase to be ready
        if (window.seatDatabase && window.seatDatabase.initPromise) {
            await window.seatDatabase.initPromise;
        }
        
        // Refresh data from Firebase
        if (window.seatDatabase && window.seatDatabase.refresh) {
            await window.seatDatabase.refresh();
        }

        // Get current user ID
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId) {
            const noUserHtml = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-person-x fs-1"></i>
                    <p class="mt-2">Please log in to view your bookings</p>
                </div>
            `;
            if (desktopContainer) desktopContainer.innerHTML = noUserHtml;
            if (mobileContainer) mobileContainer.innerHTML = noUserHtml;
            return;
        }

        const now = new Date();
        let foundActiveBookings = false;
        const bookingCards = [];

        // Check all food centers
        ['maxwell', 'newton', 'changiVillage'].forEach(foodCenter => {
            const bookings = window.seatDatabase.getAllSeats(foodCenter);
            
            for (const table in bookings) {
                for (const seat in bookings[table]) {
                    const booking = bookings[table][seat];
                    
                    // Only show bookings that belong to the current user and haven't expired
                    if (booking.status === 'booked' && 
                        booking.expiresAt && 
                        booking.bookedBy === currentUserId) {
                        const expiresAt = new Date(booking.expiresAt);
                        if (expiresAt > now) {
                            foundActiveBookings = true;
                            
                            // Calculate expiresAt from timeslot + duration if available
                            let displayExpiresAt = booking.expiresAt;
                            if (booking.timeslot && booking.duration) {
                                const calculatedExpiresAt = this.calculateExpiresAt(booking.timeslot, booking.duration);
                                if (calculatedExpiresAt) {
                                    displayExpiresAt = calculatedExpiresAt.toISOString();
                                }
                            }
                            
                            // Create booking card HTML
                            const cardHtml = `
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
                                    <span class="detail-value">${this.formatDateTime(displayExpiresAt)}</span>
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
                            bookingCards.push(`<div class="booking-card">${cardHtml}</div>`);
                        }
                    }
                }
            }
        });

        // Update both containers with the same content
        const contentHtml = foundActiveBookings 
            ? bookingCards.join('')
            : `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-calendar-x fs-1"></i>
                    <p class="mt-2">No active bookings found</p>
                </div>
            `;
        
        if (desktopContainer) desktopContainer.innerHTML = contentHtml;
        if (mobileContainer) mobileContainer.innerHTML = contentHtml;
    }
}

// Create global instance
window.bookingHistory = new BookingHistory();