// Seat Database Management System - Firebase Firestore Integration
class SeatDatabase {
    constructor() {
        this.bookings = {}; // In-memory cache
        this.db = null;
        this.initialized = false;
        this.initPromise = this.initializeFirebase();
    }

    // Initialize Firebase connection
    async initializeFirebase() {
        try {
            // Wait for Firebase to be initialized
            if (window.firebaseInitPromise) {
                await window.firebaseInitPromise;
            }
            
            // Wait a bit for Firebase to be fully ready
            let attempts = 0;
            while ((!window.db || !window.doc || !window.setDoc || !window.getDoc || !window.updateDoc) && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (!window.db) {
                console.warn('Firebase not initialized, falling back to localStorage');
                this.db = null;
                this.bookings = this.loadFromStorage();
                this.cleanupExpiredBookings();
                return;
            }

            this.db = window.db;
            this.initialized = true;
            console.log('✅ SeatDatabase: Firebase initialized');
            
            // Load initial data from Firebase
            await this.loadFromFirebase();
            this.cleanupExpiredBookings();
        } catch (error) {
            console.error('Error initializing Firebase for SeatDatabase:', error);
            this.db = null;
            this.bookings = this.loadFromStorage();
            this.cleanupExpiredBookings();
        }
    }

    // Get seat document ID
    getSeatDocId(foodCenter, table, seat) {
        return `${foodCenter}_${table}_${seat}`;
    }

    // Load all seats from Firebase
    async loadFromFirebase() {
        if (!this.db) return;

        try {
            const seatsRef = window.collection(this.db, 'seats');
            const snapshot = await window.getDocs(seatsRef);
            
            // Reset bookings structure
            this.bookings = {};

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const { foodCenter, table, seat, status, bookedBy, bookedAt, expiresAt } = data;

                if (!this.bookings[foodCenter]) {
                    this.bookings[foodCenter] = {};
                }
                if (!this.bookings[foodCenter][table]) {
                    this.bookings[foodCenter][table] = {};
                }

                this.bookings[foodCenter][table][seat] = {
                    status: status || 'available',
                    bookedBy: bookedBy || null,
                    bookedAt: bookedAt || null,
                    expiresAt: expiresAt || null
                };
            });

            console.log('✅ SeatDatabase: Loaded seats from Firebase');
        } catch (error) {
            console.error('Error loading seats from Firebase:', error);
        }
    }

    // Initialize database with all seats available (only if not already seeded)
    async initializeDatabase() {
        if (!this.db) {
            this.initializeDatabaseLocal();
            return;
        }

        try {
            // Check if seats already exist
            const seatsRef = window.collection(this.db, 'seats');
            const snapshot = await window.getDocs(seatsRef);
            
            if (snapshot.size > 0) {
                console.log('Seats already exist in Firebase, skipping initialization');
                await this.loadFromFirebase();
                return;
            }

            // Initialize Maxwell Food Centre - 6 tables, 12 seats each
            for (let table = 1; table <= 6; table++) {
                for (let seat = 1; seat <= 12; seat++) {
                    await this.setSeatInFirebase('maxwell', table, seat, {
                        status: 'available',
                        bookedBy: null,
                        bookedAt: null,
                        expiresAt: null
                    });
                }
            }

            // Initialize Newton Food Centre - 5 tables, 10 seats each
            for (let table = 1; table <= 5; table++) {
                for (let seat = 1; seat <= 10; seat++) {
                    await this.setSeatInFirebase('newton', table, seat, {
                        status: 'available',
                        bookedBy: null,
                        bookedAt: null,
                        expiresAt: null
                    });
                }
            }

            // Initialize Changi Village Food Centre - 6 tables, 10 seats each
            for (let table = 1; table <= 6; table++) {
                for (let seat = 1; seat <= 10; seat++) {
                    await this.setSeatInFirebase('changiVillage', table, seat, {
                        status: 'available',
                        bookedBy: null,
                        bookedAt: null,
                        expiresAt: null
                    });
                }
            }

            await this.loadFromFirebase();
            console.log('✅ SeatDatabase: Initialized all seats in Firebase');
        } catch (error) {
            console.error('Error initializing database in Firebase:', error);
        }
    }

    // Initialize individual food center
    async initializeFoodCenter(foodCenter) {
        if (!this.db) {
            this.initializeFoodCenterLocal(foodCenter);
            return;
        }

        try {
            let tableCount = 0;
            let seatsPerTable = 0;

            if (foodCenter === 'maxwell') {
                tableCount = 6;
                seatsPerTable = 12;
            } else if (foodCenter === 'newton') {
                tableCount = 5;
                seatsPerTable = 10;
            } else if (foodCenter === 'changiVillage') {
                tableCount = 6;
                seatsPerTable = 10;
            }

            for (let table = 1; table <= tableCount; table++) {
                for (let seat = 1; seat <= seatsPerTable; seat++) {
                    await this.setSeatInFirebase(foodCenter, table, seat, {
                        status: 'available',
                        bookedBy: null,
                        bookedAt: null,
                        expiresAt: null
                    });
                }
            }

            await this.loadFromFirebase();
        } catch (error) {
            console.error(`Error initializing ${foodCenter} in Firebase:`, error);
        }
    }

    // Set seat data in Firebase
    async setSeatInFirebase(foodCenter, table, seat, seatData) {
        if (!this.db) return;

        try {
            const docId = this.getSeatDocId(foodCenter, table, seat);
            const seatRef = window.doc(this.db, 'seats', docId);
            
            await window.setDoc(seatRef, {
                foodCenter,
                table: parseInt(table),
                seat: parseInt(seat),
                status: seatData.status,
                bookedBy: seatData.bookedBy || null,
                bookedAt: seatData.bookedAt || null,
                expiresAt: seatData.expiresAt || null
            }, { merge: true });

            // Update local cache
            if (!this.bookings[foodCenter]) {
                this.bookings[foodCenter] = {};
            }
            if (!this.bookings[foodCenter][table]) {
                this.bookings[foodCenter][table] = {};
            }
            this.bookings[foodCenter][table][seat] = seatData;
        } catch (error) {
            console.error(`Error setting seat ${foodCenter}_${table}_${seat}:`, error);
        }
    }

    // Book a seat
    async bookSeat(foodCenter, table, seat, duration = 60) {
        await this.initPromise;

        if (!this.bookings[foodCenter]) {
            this.bookings[foodCenter] = {};
        }
        if (!this.bookings[foodCenter][table]) {
            this.bookings[foodCenter][table] = {};
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + duration * 60000); // duration in minutes

        const userId = localStorage.getItem('loggedInUserId') || 'user_' + Date.now();

        const seatData = {
            status: 'booked',
            bookedBy: userId,
            bookedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString()
        };

        if (this.db) {
            await this.setSeatInFirebase(foodCenter, table, seat, seatData);
        } else {
            this.bookings[foodCenter][table][seat] = seatData;
            this.saveToStorage();
        }

        return true;
    }

    // Release a seat
    async releaseSeat(foodCenter, table, seat) {
        await this.initPromise;

        const seatData = {
            status: 'available',
            bookedBy: null,
            bookedAt: null,
            expiresAt: null
        };

        if (this.db) {
            await this.setSeatInFirebase(foodCenter, table, seat, seatData);
        } else {
            if (this.bookings[foodCenter] && this.bookings[foodCenter][table] && this.bookings[foodCenter][table][seat]) {
                this.bookings[foodCenter][table][seat] = seatData;
                this.saveToStorage();
                return true;
            }
            return false;
        }
        return true;
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
    async getSeatCounts(foodCenter) {
        await this.initPromise;

        const seats = this.getAllSeats(foodCenter);
        let total = 0;
        let booked = 0;

        // If no seats exist, initialize the food center
        if (Object.keys(seats).length === 0) {
            await this.initializeFoodCenter(foodCenter);
            return await this.getSeatCounts(foodCenter); // Recursive call after initialization
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
    async cleanupExpiredBookings() {
        await this.initPromise;

        const now = new Date();
        let hasChanges = false;

        for (const foodCenter in this.bookings) {
            for (const table in this.bookings[foodCenter]) {
                for (const seat in this.bookings[foodCenter][table]) {
                    const booking = this.bookings[foodCenter][table][seat];
                    if (booking.status === 'booked' && booking.expiresAt) {
                        const expiresAt = new Date(booking.expiresAt);
                        if (now > expiresAt) {
                            await this.releaseSeat(foodCenter, table, seat);
                            hasChanges = true;
                        }
                    }
                }
            }
        }

        if (hasChanges && !this.db) {
            this.saveToStorage();
        }
    }

    // Fallback: Load from localStorage
    loadFromStorage() {
        const stored = localStorage.getItem('seatDatabase');
        if (stored) {
            return JSON.parse(stored);
        }
        return {};
    }

    // Fallback: Save to localStorage
    saveToStorage() {
        localStorage.setItem('seatDatabase', JSON.stringify(this.bookings));
    }

    // Local initialization fallback
    initializeDatabaseLocal() {
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

    // Local food center initialization fallback
    initializeFoodCenterLocal(foodCenter) {
        if (!this.bookings[foodCenter]) {
            this.bookings[foodCenter] = {};
        }

        if (foodCenter === 'maxwell') {
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

    // Auto cleanup every 5 minutes
    startAutoCleanup() {
        setInterval(() => {
            this.cleanupExpiredBookings();
        }, 5 * 60 * 1000); // 5 minutes
    }

    // Refresh seat data from Firebase
    async refresh() {
        if (this.db) {
            await this.loadFromFirebase();
        }
    }
}

// Create global instance
window.seatDatabase = new SeatDatabase();

// Initialize database if empty (after Firebase is ready)
window.seatDatabase.initPromise.then(() => {
    if (Object.keys(window.seatDatabase.bookings).length === 0) {
        window.seatDatabase.initializeDatabase();
    }
});

// Start auto cleanup
window.seatDatabase.startAutoCleanup();

