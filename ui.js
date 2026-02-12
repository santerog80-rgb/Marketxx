
// MozCommerce - UI Module

class UIManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupImagePreviews();
        this.setupModals();
        this.setupToastNotifications();
        this.setupLoadingStates();
    }

    // Setup navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                navLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    // Setup mobile menu
    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
            });
        }
    }

    // Setup image previews
    setupImagePreviews() {
        const imageInputs = document.querySelectorAll('input[type="file"][multiple]');
        
        imageInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleImageUpload(e.target);
            });
        });
    }

    handleImageUpload(input) {
        const files = input.files;
        const previewContainer = input.parentElement.querySelector('.upload-preview');
        
        if (!previewContainer) {
            const container = document.createElement('div');
            container.className = 'upload-preview';
            input.parentElement.appendChild(container);
        }

        if (files.length > 0) {
            const container = input.parentElement.querySelector('.upload-preview');
            container.innerHTML = '';

            Array.from(files).forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        const preview = document.createElement('div');
                        preview.className = 'preview-item';
                        preview.innerHTML = `
                            <img src="${e.target.result}" alt="Preview ${index + 1}">
                            <button type="button" class="remove-btn" data-index="${index}">
                                <i class="fas fa-times"></i>
                            </button>
                        `;
                        container.appendChild(preview);
                    };

                    reader.readAsDataURL(file);
                }
            });

            // Add remove button functionality
            setTimeout(() => {
                const removeButtons = container.querySelectorAll('.remove-btn');
                removeButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const index = parseInt(btn.dataset.index);
                        this.removeImage(input, index);
                    });
                });
            }, 100);
        }
    }

    removeImage(input, index) {
        const dt = new DataTransfer();
        const files = input.files;

        for (let i = 0; i < files.length; i++) {
            if (i !== index) {
                dt.items.add(files[i]);
            }
        }

        input.files = dt.files;
        this.handleImageUpload(input);
    }

    // Setup modals
    setupModals() {
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal(modal);
                });
            }

            // Close on click outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeModal(modal);
                }
            });
        });
    }

    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Setup toast notifications
    setupToastNotifications() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    showToast(message, type = 'success', duration = 3000) {
        const container = document.querySelector('.toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Setup loading states
    setupLoadingStates() {
        const buttons = document.querySelectorAll('[data-loading]');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.setButtonLoading(button, true);
            });
        });
    }

    setButtonLoading(button, isLoading, originalText = null) {
        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.disabled = true;
            button.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                ${originalText || 'Carregando...'}
            `;
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || originalText || 'Enviar';
            delete button.dataset.originalText;
        }
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-MZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Format relative time
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} minuto${diffMins !== 1 ? 's' : ''} atr\u00e1s`;
        } else if (diffHours < 24) {
            return `${diffHours} hora${diffHours !== 1 ? 's' : ''} atr\u00e1s`;
        } else if (diffDays < 7) {
            return `${diffDays} dia${diffDays !== 1 ? 's' : ''} atr\u00e1s`;
        } else {
            return this.formatDate(dateString);
        }
    }

    // Create star rating
    createStarRating(rating, interactive = false, productId = null) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            let starClass = 'far fa-star';
            if (i <= rating) {
                starClass = 'fas fa-star';
            } else if (i - 0.5 <= rating) {
                starClass = 'fas fa-star-half-alt';
            }

            if (interactive) {
                stars += `<i class="${starClass}" data-rating="${i}" data-product="${productId}"></i>`;
            } else {
                stars += `<i class="${starClass}"></i>`;
            }
        }
        return stars;
    }

    // Setup star rating interaction
    setupStarRating(productId) {
        const stars = document.querySelectorAll(`[data-product="${productId}"]`);
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.highlightStars(productId, rating);
            });

            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                this.highlightStars(productId, rating, true);
            });

            star.addEventListener('mouseout', () => {
                const selectedRating = this.getSelectedRating(productId);
                this.highlightStars(productId, selectedRating);
            });
        });
    }

    highlightStars(productId, rating, isHover = false) {
        const stars = document.querySelectorAll(`[data-product="${productId}"]`);
        
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.className = 'fas fa-star';
                if (isHover) {
                    star.style.color = '#ffc107';
                }
            } else {
                star.className = 'far fa-star';
                if (isHover) {
                    star.style.color = '';
                }
            }
        });
    }

    getSelectedRating(productId) {
        const input = document.getElementById(`rating-${productId}`);
        return input ? parseInt(input.value) : 0;
    }

    // WhatsApp integration
    openWhatsApp(phoneNumber, message = '') {
        const formattedPhone = phoneNumber.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message || WHATSAPP_CONFIG.defaultMessage);
        const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.defaultCountryCode}${formattedPhone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }

    createWhatsAppButton(product) {
        const message = encodeURIComponent(
            `Ol\u00e1! Vi o produto "${product.title}" no MozCommerce e gostaria de saber mais informa\u00e7\u00f5es. Pre\u00e7o: ${currencyManager.formatPrice(product.price)}`
        );
        
        return `
            <button class="btn btn-success whatsapp-btn" onclick="window.open('https://wa.me/${WHATSAPP_CONFIG.defaultCountryCode}${product.user_phone}?text=${message}', '_blank')">
                <i class="fab fa-whatsapp"></i>
                Contactar no WhatsApp
            </button>
        `;
    }

    // Share functionality
    shareProduct(product) {
        if (navigator.share) {
            navigator.share({
                title: product.title,
                text: product.description,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showToast('Link copiado para a \u00e1rea de transfer\u00eancia!', 'success');
            });
        }
    }

    // Favorite functionality
    toggleFavorite(productId) {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        const index = favorites.indexOf(productId);
        if (index > -1) {
            favorites.splice(index, 1);
            this.showToast('Removido dos favoritos', 'success');
        } else {
            favorites.push(productId);
            this.showToast('Adicionado aos favoritos', 'success');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        this.updateFavoriteButton(productId);
    }

    updateFavoriteButton(productId) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const button = document.querySelector(`[data-favorite="${productId}"]`);
        
        if (button) {
            const isFavorite = favorites.includes(productId);
            button.innerHTML = isFavorite 
                ? '<i class="fas fa-heart"></i>'
                : '<i class="far fa-heart"></i>';
            button.classList.toggle('active', isFavorite);
        }
    }

    // Form validation
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }

    // Smooth scroll
    smoothScroll(target, duration = 500) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;

        const targetPosition = targetElement.getBoundingClientRect().top;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // Lazy load images
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Initialize on page load
    static init() {
        const ui = new UIManager();
        
        // Expose to window for global access
        window.ui = ui;
        window.showToast = (message, type) => ui.showToast(message, type);
        window.openWhatsApp = (phone, message) => ui.openWhatsApp(phone, message);
        window.toggleFavorite = (productId) => ui.toggleFavorite(productId);
    }
}

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UIManager.init());
} else {
    UIManager.init();
}


