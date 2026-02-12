
// MozCommerce - Authentication Module

class AuthManager {
    constructor() {
        this.user = null;
        this.session = null;
        this.init();
    }

    async init() {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.user = session.user;
            this.session = session;
            this.updateUIForLoggedInUser();
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            this.user = session?.user || null;
            this.session = session || null;
            
            if (event === 'SIGNED_IN') {
                this.updateUIForLoggedInUser();
                this.showToast('Login realizado com sucesso!', 'success');
            } else if (event === 'SIGNED_OUT') {
                this.updateUIForLoggedOutUser();
                this.showToast('Logout realizado com sucesso', 'success');
            }
        });

        this.setupAuthForms();
    }

    setupAuthForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Setup logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Store user preferences
            await this.storeUserPreferences(data.user.id);
            
            window.location.href = 'dashboard.html';
        } catch (error) {
            this.showToast('Erro ao fazer login: ' + error.message, 'error');
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const province = document.getElementById('registerProvince').value;
        const terms = document.getElementById('registerTerms').checked;

        // Validation
        if (password !== confirmPassword) {
            this.showToast('As senhas n\u00e3o coincidem', 'error');
            return;
        }

        if (!terms) {
            this.showToast('Voc\u00ea deve aceitar os termos de uso', 'error');
            return;
        }

        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        phone,
                        province
                    }
                }
            });

            if (authError) throw authError;

            // Create user profile in database
            const { error: profileError } = await supabase
                .from('users')
                .insert([{
                    id: authData.user.id,
                    email,
                    name,
                    phone,
                    province,
                    created_at: new Date().toISOString()
                }]);

            if (profileError) throw profileError;

            this.showToast('Registro realizado com sucesso! Fa\u00e7a login para continuar.', 'success');
            
            // Switch to login tab
            setTimeout(() => {
                this.switchAuthTab('login');
            }, 1500);

        } catch (error) {
            this.showToast('Erro ao registrar: ' + error.message, 'error');
        }
    }

    async handleLogout() {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem('userPreferences');
            window.location.href = 'index.html';
        } catch (error) {
            this.showToast('Erro ao fazer logout', 'error');
        }
    }

    async storeUserPreferences(userId) {
        const preferences = {
            currency: document.getElementById('currencySelector')?.value || 'MZN',
            language: 'pt-MZ',
            notifications: true
        };

        try {
            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: userId,
                    preferences,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (!error) {
                localStorage.setItem('userPreferences', JSON.stringify(preferences));
            }
        } catch (error) {
            console.error('Error storing preferences:', error);
        }
    }

    updateUIForLoggedInUser() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (dashboardBtn) dashboardBtn.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    }

    updateUIForLoggedOutUser() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (registerBtn) registerBtn.style.display = 'inline-flex';
        if (dashboardBtn) dashboardBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

    switchAuthTab(tab) {
        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
        const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (tab === 'login') {
            loginTab?.classList.add('active');
            registerTab?.classList.remove('active');
            loginForm?.classList.add('active');
            registerForm?.classList.remove('active');
        } else {
            loginTab?.classList.remove('active');
            registerTab?.classList.add('active');
            loginForm?.classList.remove('active');
            registerForm?.classList.add('active');
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast container
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getCurrentUser() {
        return this.user;
    }

    isAuthenticated() {
        return this.user !== null;
    }
}

// Initialize auth manager
const auth = new AuthManager();


