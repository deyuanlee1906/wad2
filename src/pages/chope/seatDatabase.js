// Seat Database Management System
class SeatDatabase {
    constructor() {
        this.bookings = this.loadFromStorage();
        this.cleanupExpiredBookings();
    }

    // Initialize database with all seats available
    initializeDatabase() {
        // Maxwell Food Centre - 6 tables, 12 seats each
        const maxwellSeats = {};
        for (let table = 1; table <= 6; table++) {
            maxwellSeats[table] = {};
            for (let seat = 1; seat <= 12; seat++) {
                maxwellSeats[table][seat] = {
                    status: 'available',
                    bookedBy: null,
                    bookedAt: null,
                    expiresAt: null
                };
            }
        }
        this.bookings.maxwell = maxwellSeats;

        // Newton Food Centre - 5 tables, 10 seats each
        const newtonSeats = {};
        for (let table = 1; table <= 5; table++) {
            newtonSeats[table] = {};
            for (let seat = 1; seat <= 10; seat++) {
                newtonSeats[table][seat] = {
                    status: 'available',
                    bookedBy: null,
                    bookedAt: null,
                    expiresAt: null
                };
            }
        }
        this.bookings.newton = newtonSeats;

        // Changi Village Food Centre - 6 tables, 10 seats each
        const changiVillageSeats = {};
        for (let table = 1; table <= 6; table++) {
            changiVillageSeats[table] = {};
            for (let seat = 1; seat <= 10; seat++) {
                changiVillageSeats[table][seat] = {
                    status: 'available',
                    bookedBy: null,
                    bookedAt: null,
                    expiresAt: null
                };
            }
        }
        this.bookings.changiVillage = changiVillageSeats;
        
        this.saveToStorage();
    }

    // Initialize individual food center
    initializeFoodCenter(foodCenter) {
        if (!this.bookings[foodCenter]) {
            this.bookings[foodCenter] = {};
        }

        if (foodCenter === 'maxwell') {
            // Maxwell Food Centre - 6 tables, 12 seats each
            for (let table = 1; table <= 6; table++) {
                this.bookings[foodCenter][table] = {};
                for (let seat = 1; seat <= 12; seat++) {
                    this.bookings[foodCenter][table][seat] = {
                        status: 'available',
                        bookedBy: null,
                        bookedAt: null,
                        expiresAt: null
                    };
                }
            }
        } else if (foodCenter === 'newton') {
            // Newton Food Centre - 5 tables, 10 seats each
            for (let table = 1; table <= 5; table++) {
                this.bookings[foodCenter][table] = {};
                for (let seat = 1; seat <= 10; seat++) {
                    this.bookings[foodCenter][table][seat] = {
                        status: 'available',
                        bookedBy: null,
                        bookedAt: null,
                        expiresAt: null
                    };
                }
            }
        } else if (foodCenter === 'changiVillage') {
            // Changi Village Food Centre - 6 tables, 10 seats each
            for (let table = 1; table <= 6; table++) {
                this.bookings[foodCenter][table] = {};
                for (let seat = 1; seat <= 10; seat++) {
                    this.bookings[foodCenter][table][seat] = {
                        status: 'available',
                        bookedBy: null,
                        bookedAt: null,
                        expiresAt: null
                    };
                }
            }
        }

        this.saveToStorage();
    }

    // Book a seat
    bookSeat(foodCenter, table, seat, duration = 60) {
        if (!this.bookings[foodCenter]) {
            this.bookings[foodCenter] = {};
        }
        if (!this.bookings[foodCenter][table]) {
            this.bookings[foodCenter][table] = {};
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + duration * 60000); // duration in minutes

        this.bookings[foodCenter][table][seat] = {
            status: 'booked',
            bookedBy: 'user_' + Date.now(), // In real app, this would be user ID
            bookedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString()
        };

        this.saveToStorage();
        return true;
    }

    // Release a seat
    releaseSeat(foodCenter, table, seat) {
        if (this.bookings[foodCenter] && this.bookings[foodCenter][table] && this.bookings[foodCenter][table][seat]) {
            this.bookings[foodCenter][table][seat] = {
                status: 'available',
                bookedBy: null,
                bookedAt: null,
                expiresAt: null
            };
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Get seat status
    getSeatStatus(foodCenter, table, seat) {
        if (this.bookings[foodCenter] && this.bookings[foodCenter][table] && this.bookings[foodCenter][table][seat]) {
            return this.bookings[foodCenter][table][seat].status;
        }
        return 'available';
    }

    // Get all seats for a food center
    getAllSeats(foodCenter) {
        return this.bookings[foodCenter] || {};
    }

    // Get available and booked counts
    getSeatCounts(foodCenter) {
        const seats = this.getAllSeats(foodCenter);
        let total = 0;
        let booked = 0;

        // If no seats exist, initialize the food center
        if (Object.keys(seats).length === 0) {
            this.initializeFoodCenter(foodCenter);
            return this.getSeatCounts(foodCenter); // Recursive call after initialization
        }

        for (const table in seats) {
            for (const seat in seats[table]) {
                total++;
                if (seats[table][seat].status === 'booked') {
                    booked++;
                }
            }
        }

        return {
            total: total,
            booked: booked,
            available: total - booked
        };
    }

    // Clean up expired bookings
    cleanupExpiredBookings() {
        const now = new Date();
        let hasChanges = false;

        for (const foodCenter in this.bookings) {
            for (const table in this.bookings[foodCenter]) {
                for (const seat in this.bookings[foodCenter][table]) {
                    const booking = this.bookings[foodCenter][table][seat];
                    if (booking.status === 'booked' && booking.expiresAt) {
                        const expiresAt = new Date(booking.expiresAt);
                        if (now > expiresAt) {
                            this.releaseSeat(foodCenter, table, seat);
                            hasChanges = true;
                        }
                    }
                }
            }
        }

        if (hasChanges) {
            this.saveToStorage();
        }
    }

    // Load from localStorage
    loadFromStorage() {
        const stored = localStorage.getItem('seatDatabase');
        if (stored) {
            return JSON.parse(stored);
        }
        return {};
    }

    // Save to localStorage
    saveToStorage() {
        localStorage.setItem('seatDatabase', JSON.stringify(this.bookings));
    }

    // Auto cleanup every 5 minutes
    startAutoCleanup() {
        setInterval(() => {
            this.cleanupExpiredBookings();
        }, 5 * 60 * 1000); // 5 minutes
    }
}

// Create global instance
window.seatDatabase = new SeatDatabase();

// Initialize database if empty
if (Object.keys(window.seatDatabase.bookings).length === 0) {
    window.seatDatabase.initializeDatabase();
}

// Start auto cleanup
window.seatDatabase.startAutoCleanup();
