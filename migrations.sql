
-- LookBook Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS lookbook;
USE lookbook;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descrizione TEXT,
    taglia VARCHAR(10),
    marca VARCHAR(100),
    condizione ENUM('nuovo', 'ottimo', 'buono', 'discreto') DEFAULT 'buono',
    prezzo DECIMAL(10, 2),
    immagini JSON,
    user_id INT NOT NULL,
    disponibile BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Swaps table
CREATE TABLE IF NOT EXISTS swaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_richiedente_id INT NOT NULL,
    user_proprietario_id INT NOT NULL,
    product_richiesto_id INT NOT NULL,
    product_offerto_id INT NOT NULL,
    stato ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    messaggio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_richiedente_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_proprietario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_richiesto_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (product_offerto_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_disponibile ON products(disponibile);
CREATE INDEX idx_swaps_user_richiedente ON swaps(user_richiedente_id);
CREATE INDEX idx_swaps_user_proprietario ON swaps(user_proprietario_id);
CREATE INDEX idx_swaps_stato ON swaps(stato);
CREATE INDEX idx_swaps_created_at ON swaps(created_at);
