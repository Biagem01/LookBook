# 👚 LookBook

LookBook è una piattaforma per la vendita e lo scambio di abbigliamento second hand. Questo progetto rappresenta un API RESTful backend realizzato in Node.js, pensato per semplificare l’esperienza di utenti che desiderano vendere, acquistare o scambiare capi d’abbigliamento.

# 🚀 Obiettivo
Sviluppare una REST API completa e sicura per:

la gestione di prodotti (vestiti usati),

la gestione utenti,

lo scambio (swap) tra utenti,

e il supporto al caricamento immagini.

🛠️ Le API sono costruite usando Node.js, Express, MySQL e Multer. Tutte le query SQL sono protette da prepared statements contro SQL Injection.


# 📦 Funzionalità implementate

- 👤 Gestione Utenti
Registrazione e login con password hashata (JWT token-based).

Recupero dati utente autenticato.

- 👕 Gestione Prodotti
CRUD completo: creare, modificare, eliminare e visualizzare prodotti.

Caricamento multiplo di immagini tramite Multer.

Gestione stato disponibile / non disponibile.

Associazione dei prodotti all'utente creatore.

- 🔁 Sistema di Swap (Scambio)
Creazione proposta di scambio tra due utenti.

Stato dello swap: pending, accepted, rejected.

Gestione cronologia scambi.

Validazione per impedire scambi doppi o abusivi.


- 🗂️ Filtri e Ricerca
Filtro prodotti per:

Data di inserimento (da / a)

Disponibilità

Visualizzazione scambi filtrati per stato.

▶️ Come avviare il progetto
1. Clona la repo
2. Installa le dipendenze ==> npm install
3. Crea il file .env
4. Crea il database ==> importa lo schema SQL
5. Avvia il server ==> npm run dev


Il server sarà disponibile su http://localhost:PORT.

# 📸 Upload immagini
I file vengono caricati nella directory /uploads e serviti pubblicamente.
Ogni prodotto può contenere più immagini (supporto a multipart/form-data).

# 📱 Esempi di Rotte API
🔐 Autenticazione
POST /auth/register

POST /auth/login

GET /auth/me

👤 Utenti
PUT /users/:id

👕 Prodotti
GET /products

GET /products/my (autenticato)

POST /products (autenticato + immagini)

PUT /products/:id

DELETE /products/:id






