
// MozCommerce - Currency Module

class CurrencyManager {
    constructor() {
        this.currentCurrency = this.getCurrencyPreference();
        this.init();
    }

    init() {
        // Setup currency selector
        const currencySelector = document.getElementById('currencySelector');
        if (currencySelector) {
            currencySelector.value = this.currentCurrency;
            currencySelector.addEventListener('change', (e) => this.changeCurrency(e.target.value));
        }

        // Load saved preference
        this.loadCurrencyPreference();
    }

    // Convert price to selected currency
    convertPrice(priceInMZN, targetCurrency = null) {
        const currency = targetCurrency || this.currentCurrency;
        const rate = CURRENCY_RATES[currency] || 1;
        const convertedPrice = priceInMZN * rate;
        return this.formatCurrency(convertedPrice, currency);
    }

    // Format currency
    formatCurrency(amount, currency = null) {
        const curr = currency || this.currentCurrency;
        const symbol = CURRENCY_SYMBOLS[curr] || '';
        const formattedAmount = amount.toLocaleString('pt-MZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return `${symbol} ${formattedAmount}`;
    }

    // Change currency
    changeCurrency(newCurrency) {
        this.currentCurrency = newCurrency;
        
        // Save preference
        localStorage.setItem('mozcommerce_currency', newCurrency);
        
        // Update all prices on the page
        this.updateAllPrices();
        
        // Save to user profile if logged in
        if (authManager && authManager.isAuthenticated) {
            authManager.saveCurrencyPreference(newCurrency);
        }

        // Show toast notification
        this.showToast(`Moeda alterada para ${CURRENCY_NAMES[newCurrency]}`);
    }

    // Update all prices on the page
    updateAllPrices() {
        // Update product prices
        const priceElements = document.querySelectorAll('[data-original-price]');
        priceElements.forEach(element => {
            const originalPrice = parseFloat(element.getAttribute('data-original-price'));
            const convertedPrice = this.convertPrice(originalPrice);
            element.textContent = convertedPrice;
            element.setAttribute('data-currency', this.currentCurrency);
        });

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('currencyChanged', {
            detail: { currency: this.currentCurrency }
        }));
    }

    // Get currency preference
    getCurrencyPreference() {
        return localStorage.getItem('mozcommerce_currency') || 'MZN';
    }

    // Load currency preference
    loadCurrencyPreference() {
        const savedCurrency = this.getCurrencyPreference();
        if (savedCurrency && savedCurrency !== this.currentCurrency) {
            this.currentCurrency = savedCurrency;
            const selector = document.getElementById('currencySelector');
            if (selector) {
                selector.value = savedCurrency;
            }
            this.updateAllPrices();
        }
    }

    // Show toast notification
    showToast(message) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'success');
        }
    }

    // Get current currency
    getCurrentCurrency() {
        return this.currentCurrency;
    }

    // Get currency symbol
    getCurrencySymbol(currency = null) {
        const curr = currency || this.currentCurrency;
        return CURRENCY_SYMBOLS[curr] || '';
    }

    // Parse price string to number
    parsePrice(priceString) {
        // Remove currency symbols and spaces
        const cleaned = priceString.replace(/[^\d.,]/g, '');
        return parseFloat(cleaned) || 0;
    }
}

// Initialize currency manager
const currencyManager = new CurrencyManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyManager;
}


