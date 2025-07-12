
class LookBookApp {
    constructor() {
        this.API_BASE = window.location.origin + '/api';
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.selectedProductForSwap = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
        this.loadProducts();
        
        // Check if user is logged in
        if (this.token) {
            this.getCurrentUser();
        }
    }

    bindEvents() {
        // Navigation events
        document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('exploreBtn').addEventListener('click', () => this.scrollToProducts());
        document.getElementById('addProductBtn').addEventListener('click', () => this.showModal('addProductModal'));

        // Form events
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('addProductForm').addEventListener('submit', (e) => this.handleAddProduct(e));
        document.getElementById('createSwapForm').addEventListener('submit', (e) => this.handleCreateSwap(e));

        // Filter events
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());

        // Modal events
        this.bindModalEvents();
    }

    bindModalEvents() {
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.close');

        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    async checkAuth() {
        if (this.token) {
            try {
                const response = await fetch(`${this.API_BASE}/users/me`, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                
                if (response.ok) {
                    this.currentUser = await response.json();
                    this.updateUI();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                this.logout();
            }
        }
    }

    async getCurrentUser() {
        // For now, we'll decode the user info from the token or make an API call
        // This is a simplified version - in a real app you'd validate the token properly
        this.updateUI();
    }

    updateUI() {
        const navButtons = document.getElementById('navButtons');
        const userMenu = document.getElementById('userMenu');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const addProductBtn = document.getElementById('addProductBtn');

        if (this.token) {
            loginBtn.classList.add('hidden');
            registerBtn.classList.add('hidden');
            userMenu.classList.remove('hidden');
            addProductBtn.classList.remove('hidden');
            
            if (this.currentUser) {
                document.getElementById('userName').textContent = 
                    `${this.currentUser.nome} ${this.currentUser.cognome}`;
            }
        } else {
            loginBtn.classList.remove('hidden');
            registerBtn.classList.remove('hidden');
            userMenu.classList.add('hidden');
            addProductBtn.classList.add('hidden');
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    scrollToProducts() {
        document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.API_BASE}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.updateUI();
                this.hideModal('loginModal');
                this.showSuccess('Login effettuato con successo!');
                this.loadProducts(); // Reload to show user-specific options
            } else {
                this.showError(data.error || 'Errore nel login');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Errore di connessione');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const nome = document.getElementById('registerNome').value;
        const cognome = document.getElementById('registerCognome').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch(`${this.API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, cognome, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.updateUI();
                this.hideModal('registerModal');
                this.showSuccess('Registrazione completata con successo!');
                this.loadProducts();
            } else {
                this.showError(data.error || 'Errore nella registrazione');
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showError('Errore di connessione');
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        this.updateUI();
        this.loadProducts(); // Reload to hide user-specific options
        this.showSuccess('Logout effettuato con successo!');
    }

    async loadProducts(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`${this.API_BASE}/products?${queryParams}`);
            const products = await response.json();

            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Errore nel caricamento dei prodotti');
        }
    }

    renderProducts(products) {
        const grid = document.getElementById('productsGrid');
        
        if (products.length === 0) {
            grid.innerHTML = '<p class="loading">Nessun prodotto trovato</p>';
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="product-card" onclick="app.showProductDetail(${product.id})">
                <img src="${product.immagini && product.immagini.length > 0 ? product.immagini[0] : '/placeholder.jpg'}" 
                     alt="${product.nome}" class="product-image" 
                     onerror="this.src='/placeholder.jpg'">
                <div class="product-info">
                    <h3 class="product-title">${product.nome}</h3>
                    <div class="product-details">
                        ${product.marca ? `<span>Marca: ${product.marca}</span><br>` : ''}
                        ${product.taglia ? `<span>Taglia: ${product.taglia}</span><br>` : ''}
                        <span>Condizione: ${product.condizione}</span>
                    </div>
                    ${product.prezzo ? `<div class="product-price">€${product.prezzo}</div>` : ''}
                    <span class="product-status ${product.disponibile ? 'status-available' : 'status-unavailable'}">
                        ${product.disponibile ? 'Disponibile' : 'Non disponibile'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    async showProductDetail(productId) {
        try {
            const response = await fetch(`${this.API_BASE}/products/${productId}`);
            const product = await response.json();

            if (response.ok) {
                this.renderProductDetail(product);
                this.showModal('productDetailModal');
            } else {
                this.showError('Errore nel caricamento del prodotto');
            }
        } catch (error) {
            console.error('Error loading product detail:', error);
            this.showError('Errore di connessione');
        }
    }

    renderProductDetail(product) {
        const content = document.getElementById('productDetailContent');
        
        content.innerHTML = `
            <div class="product-detail">
                <div class="product-images">
                    <img src="${product.immagini && product.immagini.length > 0 ? product.immagini[0] : '/placeholder.jpg'}" 
                         alt="${product.nome}" class="product-image-main" id="mainImage"
                         onerror="this.src='/placeholder.jpg'">
                    ${product.immagini && product.immagini.length > 1 ? `
                        <div class="product-images-thumbs">
                            ${product.immagini.map((img, index) => `
                                <img src="${img}" alt="${product.nome}" 
                                     class="product-image-thumb ${index === 0 ? 'active' : ''}"
                                     onclick="app.changeMainImage('${img}', this)"
                                     onerror="this.src='/placeholder.jpg'">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="product-info">
                    <h2>${product.nome}</h2>
                    <p><strong>Proprietario:</strong> ${product.user_nome} ${product.user_cognome}</p>
                    ${product.descrizione ? `<p><strong>Descrizione:</strong> ${product.descrizione}</p>` : ''}
                    ${product.marca ? `<p><strong>Marca:</strong> ${product.marca}</p>` : ''}
                    ${product.taglia ? `<p><strong>Taglia:</strong> ${product.taglia}</p>` : ''}
                    <p><strong>Condizione:</strong> ${product.condizione}</p>
                    ${product.prezzo ? `<p><strong>Prezzo:</strong> €${product.prezzo}</p>` : ''}
                    <p><strong>Stato:</strong> 
                        <span class="product-status ${product.disponibile ? 'status-available' : 'status-unavailable'}">
                            ${product.disponibile ? 'Disponibile' : 'Non disponibile'}
                        </span>
                    </p>
                    ${this.token && product.disponibile && this.currentUser && product.user_id !== this.currentUser.id ? `
                        <div class="product-actions">
                            <button class="btn btn-primary" onclick="app.proposeSwap(${product.id})">
                                Proponi Scambio
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    changeMainImage(src, thumb) {
        document.getElementById('mainImage').src = src;
        
        // Update active thumb
        document.querySelectorAll('.product-image-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
    }

    async proposeSwap(productId) {
        this.selectedProductForSwap = productId;
        
        // Load user's products for swap
        try {
            const response = await fetch(`${this.API_BASE}/products?user_id=${this.currentUser.id}&disponibile=true`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const userProducts = await response.json();

            const select = document.getElementById('myProductSelect');
            select.innerHTML = '<option value="">Seleziona il tuo prodotto da offrire</option>' +
                userProducts.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');

            this.hideModal('productDetailModal');
            this.showModal('createSwapModal');
        } catch (error) {
            console.error('Error loading user products:', error);
            this.showError('Errore nel caricamento dei tuoi prodotti');
        }
    }

    async handleCreateSwap(e) {
        e.preventDefault();
        
        const productOfferedId = document.getElementById('myProductSelect').value;
        const message = document.getElementById('swapMessage').value;

        if (!productOfferedId) {
            this.showError('Seleziona un prodotto da offrire');
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE}/swaps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    user_richiedente_id: this.currentUser.id,
                    product_richiesto_id: this.selectedProductForSwap,
                    product_offerto_id: parseInt(productOfferedId),
                    messaggio: message
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.hideModal('createSwapModal');
                this.showSuccess('Proposta di scambio inviata con successo!');
                document.getElementById('createSwapForm').reset();
            } else {
                this.showError(data.error || 'Errore nell\'invio della proposta');
            }
        } catch (error) {
            console.error('Error creating swap:', error);
            this.showError('Errore di connessione');
        }
    }

    async handleAddProduct(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('nome', document.getElementById('productNome').value);
        formData.append('descrizione', document.getElementById('productDescrizione').value);
        formData.append('taglia', document.getElementById('productTaglia').value);
        formData.append('marca', document.getElementById('productMarca').value);
        formData.append('condizione', document.getElementById('productCondizione').value);
        formData.append('prezzo', document.getElementById('productPrezzo').value);
        formData.append('user_id', this.currentUser.id);

        const files = document.getElementById('productImages').files;
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }

        try {
            const response = await fetch(`${this.API_BASE}/products`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                this.hideModal('addProductModal');
                this.showSuccess('Prodotto aggiunto con successo!');
                document.getElementById('addProductForm').reset();
                this.loadProducts(); // Reload products
            } else {
                this.showError(data.error || 'Errore nell\'aggiunta del prodotto');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            this.showError('Errore di connessione');
        }
    }

    applyFilters() {
        const filters = {};
        
        const disponibile = document.getElementById('disponibileFilter').value;
        const dateFrom = document.getElementById('dateFromFilter').value;
        const dateTo = document.getElementById('dateToFilter').value;

        if (disponibile) filters.disponibile = disponibile;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;

        this.loadProducts(filters);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1001;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize the app
const app = new LookBookApp();
