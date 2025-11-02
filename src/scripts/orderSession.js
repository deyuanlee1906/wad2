/**
 * Order Session Management System
 * Provides unified session handling across all order pages
 */

class OrderSessionManager {
    constructor() {
        this.SESSION_KEY = 'orderSession';
        this.CART_KEY = 'cart';
        this.SELECTION_KEY = 'selectionData';
        this.defaultSession = {
            foodCentre: '',
            stall: '',
            option: '',
            selectedTime: '',
            dateTime: '',
            cart: [],
            currentPage: '',
            lastUpdated: null
        };
    }

    /**
     * Save complete session data
     */
    saveSession(sessionData) {
        try {
            const session = {
                ...this.defaultSession,
                ...sessionData,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            console.log('Session saved:', session);
            return true;
        } catch (error) {
            console.error('Failed to save session:', error);
            return false;
        }
    }

    /**
     * Load session data
     */
    loadSession() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                console.log('Session loaded:', session);
                return session;
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        }
        return { ...this.defaultSession };
    }

    /**
     * Update specific session fields
     */
    updateSession(updates) {
        const currentSession = this.loadSession();
        const updatedSession = { ...currentSession, ...updates };
        return this.saveSession(updatedSession);
    }

    /**
     * Save cart data
     */
    saveCart(cartData) {
        try {
            localStorage.setItem(this.CART_KEY, JSON.stringify(cartData));
            this.updateSession({ cart: cartData });
            return true;
        } catch (error) {
            console.error('Failed to save cart:', error);
            return false;
        }
    }

    /**
     * Load cart data
     */
    loadCart() {
        try {
            const cartData = localStorage.getItem(this.CART_KEY);
            if (cartData) {
                const cart = JSON.parse(cartData);
                this.updateSession({ cart });
                return cart;
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
        return [];
    }

    /**
     * Save selection data (stall, option, time)
     */
    saveSelection(selectionData) {
        try {
            localStorage.setItem(this.SELECTION_KEY, JSON.stringify(selectionData));
            this.updateSession({
                foodCentre: selectionData.foodCentre || '',
                stall: selectionData.stall || '',
                option: selectionData.option || '',
                selectedTime: selectionData.selectedTime || '',
                dateTime: selectionData.dateTime || ''
            });
            return true;
        } catch (error) {
            console.error('Failed to save selection:', error);
            return false;
        }
    }

    /**
     * Load selection data
     */
    loadSelection() {
        try {
            const selectionData = localStorage.getItem(this.SELECTION_KEY);
            if (selectionData) {
                return JSON.parse(selectionData);
            }
        } catch (error) {
            console.error('Failed to load selection:', error);
        }
        return {};
    }

    /**
     * Clear all session data
     */
    clearSession() {
        try {
            localStorage.removeItem(this.SESSION_KEY);
            localStorage.removeItem(this.CART_KEY);
            localStorage.removeItem(this.SELECTION_KEY);
            console.log('Session cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear session:', error);
            return false;
        }
    }

    /**
     * Clear cart only
     */
    clearCart() {
        try {
            localStorage.removeItem(this.CART_KEY);
            this.updateSession({ cart: [] });
            return true;
        } catch (error) {
            console.error('Failed to clear cart:', error);
            return false;
        }
    }

    /**
     * Get session status
     */
    getSessionStatus() {
        const session = this.loadSession();
        return {
            hasSession: !!session.foodCentre,
            hasCart: session.cart && session.cart.length > 0,
            hasSelection: !!(session.option && session.selectedTime),
            lastUpdated: session.lastUpdated,
            sessionData: session
        };
    }

    /**
     * Validate session data
     */
    validateSession() {
        const session = this.loadSession();
        const errors = [];

        if (!session.foodCentre) errors.push('Food centre not selected');
        if (!session.stall) errors.push('Stall not selected');
        if (!session.option) errors.push('Order option not selected');
        if (!session.selectedTime) errors.push('Time not selected');
        if (!session.cart || session.cart.length === 0) errors.push('Cart is empty');

        return {
            isValid: errors.length === 0,
            errors: errors,
            session: session
        };
    }

    /**
     * Restore page state based on current page
     */
    restorePageState(pageName) {
        const session = this.loadSession();
        
        switch (pageName) {
            case 'selection':
                return this.restoreSelectionPage(session);
            case 'checkout':
                return this.restoreCheckoutPage(session);
            case 'payment':
                return this.restorePaymentPage(session);
            default:
                return session;
        }
    }

    /**
     * Restore selection page state
     */
    restoreSelectionPage(session) {
        if (session.option) {
            // Restore option selection
            setTimeout(() => {
                const optionButtons = document.querySelectorAll('.btn-modern');
                optionButtons.forEach(btn => {
                    if (btn.textContent.trim() === session.option) {
                        btn.click();
                    }
                });
            }, 100);
        }

        if (session.selectedTime) {
            // Restore time selection
            setTimeout(() => {
                const timeSelect = document.getElementById("time");
                if (timeSelect) {
                    timeSelect.value = session.selectedTime;
                }
            }, 200);
        }

        return session;
    }

    /**
     * Restore checkout page state
     */
    restoreCheckoutPage(session) {
        // Cart data is automatically loaded by existing functions
        return session;
    }

    /**
     * Restore payment page state
     */
    restorePaymentPage(session) {
        // Payment page loads order data from localStorage
        return session;
    }
}

// Create global instance
window.OrderSession = new OrderSessionManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrderSessionManager;
}
