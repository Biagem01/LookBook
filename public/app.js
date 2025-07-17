
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
       document.getElementById('addProductBtn').addEventListener('click', () => this.openAddProductModal());
           document.getElementById('backToMainFromMyProducts').addEventListener('click', () => {
        this.loadProducts();
    });

    document.getElementById('backToMainFromSwaps').addEventListener('click', () => {
        this.loadProducts();
    });

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
            const userNameSpan = document.getElementById('userName');
            const userDropdown = document.getElementById('userDropdownMenu');

            userNameSpan.textContent = `${this.currentUser.nome} ${this.currentUser.cognome}`;
           const userArrow = document.getElementById('userArrow');

            document.getElementById('userNameContainer').onclick = () => {
                userDropdown.classList.toggle('hidden');
                userArrow.textContent = userDropdown.classList.contains('hidden') ? '▼' : '▲';
            };

            // Collega i bottoni alle funzioni
            document.getElementById('myListingsBtn').onclick = () => this.loadMyProducts();
            document.getElementById('mySwapsBtn').onclick = () => this.loadMySwaps();
            document.getElementById('myPurchasesBtn').onclick = () => this.loadMyPurchases();
        }
    } else {
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        userMenu.classList.add('hidden');
        addProductBtn.classList.add('hidden');
    }
}

async loadMyProducts() {
    if (!this.token) {
        this.showError('Devi essere loggato per vedere i tuoi prodotti');
        return;
    }

    try {
        const response = await fetch(`${this.API_BASE}/products/my`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Errore nel caricamento dei tuoi prodotti');
        }

        const products = await response.json();

        // Riempi la griglia dei miei prodotti
        this.renderProducts(products, 'myProductsGrid');

        // Mostra la sezione "I miei prodotti" e nascondi le altre
        document.getElementById('myProductsSection').classList.remove('hidden');
        document.getElementById('productsSection').classList.add('hidden');
        document.getElementById('swapsSection').classList.add('hidden');

        this.scrollToProducts();

    } catch (error) {
        console.error('Error loading my products:', error);
        this.showError(error.message);
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
            const response = await fetch(`${this.API_BASE}/users/register`, {
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

        // Riempi la griglia dei prodotti generali
        this.renderProducts(products, 'productsGrid');

        // Mostra la sezione prodotti generali e nascondi "I miei prodotti"
        document.getElementById('productsSection').classList.remove('hidden');
        document.getElementById('myProductsSection').classList.add('hidden');
        document.getElementById('swapsSection').classList.add('hidden');

        // Aggiorna titolo se vuoi (opzionale)
        const sectionTitle = document.querySelector('#productsSection .section-header h2');
        if (sectionTitle) sectionTitle.textContent = 'Prodotti Disponibili';

        this.scrollToProducts();

    } catch (error) {
        console.error('Error loading products:', error);
        this.showError('Errore nel caricamento dei prodotti');
    }
}

   renderProducts(products, gridId = 'productsGrid') {
    const grid = document.getElementById(gridId);

    if (products.length === 0) {
        grid.innerHTML = '<p class="loading">Nessun prodotto trovato</p>';
        return;
    }

  grid.innerHTML = products.map(product => `
  <div class="product-card">
    <div onclick="app.showProductDetail(${product.id})">
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
    ${gridId === 'myProductsGrid' ? `
      <button class="btn btn-danger delete-btn" onclick="app.deleteProduct(${product.id})">
        Elimina
      </button>
    ` : ''}
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
    console.log('product ricevuto:', product);  // stampa per vedere i dati reali

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
                <p><strong>Proprietario:</strong> ${product.user_nome ?? 'Sconosciuto'} ${product.user_cognome ?? ''}</p>
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
                           
                ${this.token && this.currentUser && product.user_id === this.currentUser.id ? `
                    <div class="product-actions">
                        <button class="btn btn-warning" onclick="app.openEditProductModal(${product.id})">
                            Modifica
                        </button>
                    </div>
                ` : ''}
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

openAddProductModal() {
    this.editingProductId = null;
    document.getElementById('addProductForm').reset();

    const submitBtn = document.querySelector('#addProductForm button[type="submit"]');
    submitBtn.textContent = 'Aggiungi Prodotto';

    const titleEl = document.getElementById('productFormTitle');
    if (titleEl) titleEl.textContent = 'Aggiungi Prodotto';

    // ✅ Nascondi campo disponibilità
    document.getElementById('productDisponibile').classList.add('hidden');
    document.getElementById('disponibileLabel').classList.add('hidden');

    this.showModal('addProductModal');
}



async openEditProductModal(productId) {
    try {
        this.hideModal('productDetailModal');

        const response = await fetch(`${this.API_BASE}/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!response.ok) throw new Error('Errore caricamento prodotto');
        const product = await response.json();

        // Popola i campi del form
        document.getElementById('productNome').value = product.nome;
        document.getElementById('productDescrizione').value = product.descrizione || '';
        document.getElementById('productTaglia').value = product.taglia || '';
        document.getElementById('productMarca').value = product.marca || '';
        document.getElementById('productCondizione').value = product.condizione || 'buono';
        document.getElementById('productPrezzo').value = product.prezzo || '';

        // ✅ Mostra e imposta il campo disponibilità
        const disponibileSelect = document.getElementById('productDisponibile');
        const disponibileLabel = document.getElementById('disponibileLabel');
        disponibileSelect.classList.remove('hidden');
        disponibileLabel.classList.remove('hidden');
        disponibileSelect.value = product.disponibile ? 'true' : 'false';

        this.editingProductId = productId;

        const submitBtn = document.querySelector('#addProductForm button[type="submit"]');
        submitBtn.textContent = 'Salva Modifiche';

        const titleEl = document.getElementById('productFormTitle');
        if (titleEl) titleEl.textContent = 'Modifica prodotto';

        this.showModal('addProductModal');
    } catch (error) {
        this.showError(error.message);
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
        formData.append('immagini', files[i]);
    }

    // ✅ Solo in modalità modifica, aggiungi campo "disponibile"
    if (this.editingProductId) {
        const disponibileValue = document.getElementById('productDisponibile').value;
        formData.append('disponibile', disponibileValue === 'true');
    }

    try {
        let url = `${this.API_BASE}/products`;
        let method = 'POST';

        if (this.editingProductId) {
            url = `${this.API_BASE}/products/${this.editingProductId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            this.hideModal('addProductModal');
            this.showSuccess(this.editingProductId ? 'Prodotto modificato con successo!' : 'Prodotto aggiunto con successo!');
            this.editingProductId = null;
            document.getElementById('addProductForm').reset();
            this.loadProducts();
        } else {
            this.showError(data.error || 'Errore nel salvataggio del prodotto');
        }
    } catch (error) {
        this.showError('Errore di connessione');
    }
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

async loadMySwaps() {
  if (!this.token) {
    this.showError('Devi essere loggato per vedere i tuoi scambi');
    return;
  }

  try {
    const response = await fetch(`${this.API_BASE}/swaps?user_id=${this.currentUser.id}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    const swaps = await response.json();

    // Dividi in ricevuti e inviati
    const receivedSwaps = swaps.filter(swap => swap.user_proprietario_id === this.currentUser.id && swap.stato === 'pending');
    const sentSwaps = swaps.filter(swap => swap.user_richiedente_id === this.currentUser.id && swap.stato === 'pending');

    // Scambi accettati (sia ricevuti che inviati)
    const acceptedSwaps = swaps.filter(swap => swap.stato === 'accepted');

    this.renderReceivedSwaps(receivedSwaps);
    this.renderSentSwaps(sentSwaps);
    this.renderAcceptedSwaps(acceptedSwaps);

    document.getElementById('swapsSection').classList.remove('hidden');
    document.getElementById('productsSection').classList.add('hidden');
    document.getElementById('myProductsSection').classList.add('hidden');

    this.scrollToProducts();

  } catch (error) {
    console.error('Error loading swaps:', error);
    this.showError('Errore nel caricamento degli scambi');
  }
}


renderReceivedSwaps(swaps) {
  const container = document.getElementById('receivedSwapsContainer');
  if (!swaps.length) {
    container.innerHTML = '<p class="loading">Nessuno scambio ricevuto</p>';
    return;
  }
  container.innerHTML = swaps.map(swap => `
    <div class="swap-card">
      <p><strong>Richiedente:</strong> ${swap.richiedente_nome} ${swap.richiedente_cognome}</p>
      <p><strong>Prodotto Offerto:</strong> ${swap.product_offerto_nome}</p>
      <p><strong>Messaggio:</strong> ${swap.messaggio || 'Nessun messaggio'}</p>
      <p><strong>Stato:</strong> ${swap.stato}</p>
      ${swap.stato === 'pending' ? `
        <button onclick="app.updateSwapStatus(${swap.id}, 'accepted')" class="btn btn-success">Accetta</button>
        <button onclick="app.updateSwapStatus(${swap.id}, 'rejected')" class="btn btn-danger-rejected">Rifiuta</button>
      ` : ''}
      ${swap.stato === 'accepted' ? `
        <!-- Rimuovo il bottone "Completa" -->
        <!-- <button onclick="app.updateSwapStatus(${swap.id}, 'completed')" class="btn btn-primary">Completa</button> -->
      ` : ''}
    </div>
  `).join('');
}


renderSentSwaps(swaps) {
  const container = document.getElementById('sentSwapsContainer');
  if (!swaps.length) {
    container.innerHTML = '<p class="loading">Nessuno scambio inviato</p>';
    return;
  }
  container.innerHTML = swaps.map(swap => `
    <div class="swap-card">
      <p><strong>Proprietario:</strong> ${swap.proprietario_nome} ${swap.proprietario_cognome}</p>
      <p><strong>Prodotto Richiesto:</strong> ${swap.product_richiesto_nome}</p>
      <p><strong>Messaggio:</strong> ${swap.messaggio || 'Nessun messaggio'}</p>
      <p><strong>Stato:</strong> ${swap.stato}</p>
    </div>
  `).join('');
}

renderAcceptedSwaps(swaps) {
  const container = document.getElementById('acceptedSwapsContainer');
  if (!swaps.length) {
    container.innerHTML = '<p class="loading">Nessuno scambio accettato</p>';
    return;
  }
  container.innerHTML = swaps.map(swap => `
    <div class="swap-card">
      <p><strong>Richiedente:</strong> ${swap.richiedente_nome} ${swap.richiedente_cognome}</p>
      <p><strong>Prodotto Offerto:</strong> ${swap.product_offerto_nome}</p>
      <p><strong>Prodotto Richiesto:</strong> ${swap.product_richiesto_nome}</p>
      <p><strong>Messaggio:</strong> ${swap.messaggio || 'Nessun messaggio'}</p>
      <p><strong>Stato:</strong> ${swap.stato}</p>
      <!-- Rimuovo il bottone "Completa" -->
      <!-- <button onclick="app.updateSwapStatus(${swap.id}, 'completed')" class="btn btn-primary">Completa</button> -->
    </div>
  `).join('');
}



async updateSwapStatus(swapId, newStatus) {
    console.log('updateSwapStatus chiamato con token:', this.token);
    try {
        const response = await fetch(`${this.API_BASE}/swaps/${swapId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ stato: newStatus })
        });

       if (response.status === 401 || response.status === 403) {
    this.showError('Sessione scaduta. Effettua di nuovo il login.');
    this.logout(); // oppure mostra modal login
    return;
}

        const data = await response.json();

        if (response.ok) {
            this.showSuccess(`Scambio aggiornato a "${newStatus}"`);
            await this.loadMySwaps();
            if (newStatus === 'accepted' || newStatus === 'completed') {
                await this.loadProducts();
            }
        } else {
            this.showError(data.error || 'Errore nell\'aggiornamento dello stato');
        }

    } catch (error) {
        console.error('Error updating swap status:', error);
        this.showError('Errore di connessione');
    }
}

async deleteProduct(productId) {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;

    try {
        const response = await fetch(`${this.API_BASE}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            this.showSuccess('Prodotto eliminato con successo!');
            this.loadMyProducts(); // Ricarica la lista aggiornata
        } else {
            this.showError(data.error || 'Errore durante l\'eliminazione del prodotto');
        }
    } catch (error) {
        console.error('Errore nella deleteProduct:', error);
        this.showError('Errore di connessione');
    }
}




}



// Initialize the app
const app = new LookBookApp();
