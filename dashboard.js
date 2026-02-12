
// MozCommerce - Dashboard Module

class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check authentication
        if (!authManager || !authManager.isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }

        this.currentUser = authManager.getCurrentUser();
        
        // Setup sidebar navigation
        this.setupSidebar();
        
        // Load user data
        await this.loadUserData();
        
        // Load dashboard statistics
        await this.loadStats();
        
        // Setup product form
        this.setupProductForm();
        
        // Setup profile form
        this.setupProfileForm();
    }

    setupSidebar() {
        const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
        const sections = document.querySelectorAll('.dashboard-section');

        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetSection = link.dataset.section;
                
                // Update active link
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show target section
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetSection) {
                        section.classList.add('active');
                    }
                });
            });
        });
    }

    async loadUserData() {
        try {
            // Update user info in sidebar
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            
            if (userName && this.currentUser.user_metadata?.name) {
                userName.textContent = this.currentUser.user_metadata.name;
            }
            
            if (userEmail && this.currentUser.email) {
                userEmail.textContent = this.currentUser.email;
            }

            // Load profile data
            if (db) {
                const profile = await db.getUserProfile(this.currentUser.id);
                if (profile) {
                    this.populateProfileForm(profile);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadStats() {
        try {
            if (!db) return;

            const stats = await db.getUserStats(this.currentUser.id);
            
            // Update stats display
            const totalProducts = document.getElementById('totalProducts');
            const totalViews = document.getElementById('totalViews');
            const totalMessages = document.getElementById('totalMessages');
            const avgRating = document.getElementById('avgRating');

            if (totalProducts) {
                totalProducts.textContent = stats.productsCount || 0;
            }

            // Load user's products
            await this.loadMyProducts();

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadMyProducts() {
        const productsList = document.getElementById('myProductsList');
        if (!productsList) return;

        try {
            if (!db) {
                productsList.innerHTML = '<p>Sistema de banco de dados n\u00e3o configurado.</p>';
                return;
            }

            const products = await db.getUserProducts(this.currentUser.id);

            if (products.length === 0) {
                productsList.innerHTML = `
                    <div class="no-products">
                        <i class="fas fa-box-open"></i>
                        <p>Voc\u00ea ainda n\u00e3o tem produtos.</p>
                        <a href="#" class="btn btn-primary" data-section="add-product">
                            <i class="fas fa-plus"></i> Adicionar Produto
                        </a>
                    </div>
                `;
                return;
            }

            productsList.innerHTML = products.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.images?.[0] || 'https://via.placeholder.com/200'}" alt="${product.title}">
                    </div>
                    <div class="product-info">
                        <h4>${product.title}</h4>
                        <p class="price">${currencyManager.formatPrice(product.price)}</p>
                        <div class="product-actions">
                            <button class="btn btn-sm btn-outline" onclick="dashboardManager.editProduct(${product.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="dashboardManager.deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading products:', error);
            productsList.innerHTML = '<p>Erro ao carregar produtos.</p>';
        }
    }

    setupProductForm() {
        const form = document.getElementById('addProductForm');
        if (!form) return;

        // Load categories
        this.loadCategoriesForForm();

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddProduct(form);
        });

        // Handle image upload
        const imageInput = document.getElementById('productImages');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleImagePreview(e.target);
            });
        }
    }

    async loadCategoriesForForm() {
        const categorySelect = document.getElementById('productCategory');
        if (!categorySelect) return;

        categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';

        for (const category of CATEGORIES) {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        }
    }

    handleImagePreview(input) {
        const previewContainer = input.parentElement.querySelector('.upload-preview');
        if (!previewContainer) return;

        const files = Array.from(input.files);
        
        if (files.length === 0) {
            previewContainer.innerHTML = '';
            return;
        }

        previewContainer.innerHTML = files.map((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'preview-item';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-btn" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                previewContainer.appendChild(preview);

                // Add remove handler
                preview.querySelector('.remove-btn').addEventListener('click', () => {
                    this.removeImage(input, index);
                });
            };
            reader.readAsDataURL(file);
            return '';
        }).join('');
    }

    removeImage(input, index) {
        const dt = new DataTransfer();
        const files = Array.from(input.files);
        
        files.forEach((file, i) => {
            if (i !== index) dt.items.add(file);
        });

        input.files = dt.files;
        this.handleImagePreview(input);
    }

    async handleAddProduct(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';

        try {
            const images = Array.from(document.getElementById('productImages').files);
            
            const productData = {
                title: document.getElementById('productTitle').value,
                description: document.getElementById('productDescription').value,
                price: parseFloat(document.getElementById('productPrice').value),
                currency: document.getElementById('productCurrency').value,
                categoryId: parseInt(document.getElementById('productCategory').value),
                province: document.getElementById('productProvince').value,
                location: document.getElementById('productLocation').value,
                condition: document.getElementById('productCondition').value,
                whatsappNumber: document.getElementById('productWhatsapp').value,
                negotiable: document.getElementById('productNegotiable').checked
            };

            if (!db) {
                throw new Error('Banco de dados n\u00e3o configurado');
            }

            // Create product
            const product = await db.createProduct(productData, images);

            if (product) {
                ui.showToast('Produto publicado com sucesso!', 'success');
                form.reset();
                document.querySelector('.upload-preview').innerHTML = '';
                
                // Navigate to products section
                document.querySelector('[data-section="products"]').click();
                
                // Reload products
                await this.loadMyProducts();
            }

        } catch (error) {
            console.error('Error adding product:', error);
            ui.showToast('Erro ao publicar produto: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Publicar An\u00fancio';
        }
    }

    async editProduct(productId) {
        // Load product data and show in form
        try {
            if (!db) return;

            const product = await db.getProductById(productId);
            if (!product) return;

            // Populate form
            document.getElementById('productTitle').value = product.title;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCurrency').value = product.currency || 'MZN';
            document.getElementById('productCategory').value = product.category_id;
            document.getElementById('productProvince').value = product.province;
            document.getElementById('productLocation').value = product.location || '';
            document.getElementById('productCondition').value = product.condition;
            document.getElementById('productWhatsapp').value = product.whatsapp_number || '';

            // Switch to add-product section and update button
            document.querySelector('[data-section="add-product"]').click();
            const submitBtn = document.querySelector('#addProductForm button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Produto';
            submitBtn.dataset.editingProductId = productId;

        } catch (error) {
            console.error('Error loading product:', error);
            ui.showToast('Erro ao carregar produto', 'error');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Tem certeza que deseja excluir este produto?')) {
            return;
        }

        try {
            if (!db) return;

            await db.deleteProduct(productId);
            ui.showToast('Produto exclu\u00eddo com sucesso!', 'success');
            
            // Reload products
            await this.loadMyProducts();

        } catch (error) {
            console.error('Error deleting product:', error);
            ui.showToast('Erro ao excluir produto', 'error');
        }
    }

    setupProfileForm() {
        const form = document.getElementById('profileForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUpdateProfile(form);
        });
    }

    populateProfileForm(profile) {
        const nameInput = document.getElementById('profileName');
        const emailInput = document.getElementById('profileEmail');
        const phoneInput = document.getElementById('profilePhone');
        const whatsappInput = document.getElementById('profileWhatsapp');
        const provinceInput = document.getElementById('profileProvince');
        const bioInput = document.getElementById('profileBio');

        if (nameInput) nameInput.value = profile.name || '';
        if (emailInput) emailInput.value = profile.email || '';
        if (phoneInput) phoneInput.value = profile.phone || '';
        if (whatsappInput) whatsappInput.value = profile.whatsapp || '';
        if (provinceInput) provinceInput.value = profile.province || '';
        if (bioInput) bioInput.value = profile.bio || '';
    }

    async handleUpdateProfile(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        try {
            const profileData = {
                name: document.getElementById('profileName').value,
                phone: document.getElementById('profilePhone').value,
                whatsapp: document.getElementById('profileWhatsapp').value,
                province: document.getElementById('profileProvince').value,
                bio: document.getElementById('profileBio').value
            };

            if (!db) {
                throw new Error('Banco de dados n\u00e3o configurado');
            }

            await db.updateUserProfile(this.currentUser.id, profileData);

            ui.showToast('Perfil atualizado com sucesso!', 'success');

        } catch (error) {
            console.error('Error updating profile:', error);
            ui.showToast('Erro ao atualizar perfil: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Altera\u00e7\u00f5es';
        }
    }
}

// Initialize dashboard manager
let dashboardManager;
document.addEventListener('DOMContentLoaded', () => {
    dashboardManager = new DashboardManager();
});


