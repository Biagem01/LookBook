
import Product from '../models/Product.js';
import fs from 'fs/promises';
import path from 'path';

class ProductController {
  static async getAllProducts(req, res) {
    try {
      const { disponibile, user_id, dateFrom, dateTo } = req.query;
      
      const filters = {};
      if (disponibile !== undefined) filters.disponibile = disponibile === 'true';
      if (user_id) filters.user_id = parseInt(user_id);
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const products = await Product.findAll(filters);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Errore nel recuperare i prodotti' });
    }
  }

  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Prodotto non trovato' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Errore nel recuperare il prodotto' });
    }
  }

  static async createProduct(req, res) {
    try {
      const { nome, descrizione, taglia, marca, condizione, prezzo, user_id } = req.body;

      if (!nome || !user_id) {
        return res.status(400).json({ error: 'Nome e user_id sono obbligatori' });
      }

      // Handle uploaded images
      let immagini = [];
      if (req.files && req.files.length > 0) {
        immagini = req.files.map(file => `/uploads/${file.filename}`);
      }

      const productData = {
        nome,
        descrizione,
        taglia,
        marca,
        condizione,
        prezzo: prezzo ? parseFloat(prezzo) : null,
        immagini,
        user_id: parseInt(user_id)
      };

      const product = await Product.create(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Errore nella creazione del prodotto' });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { nome, descrizione, taglia, marca, condizione, prezzo, disponibile } = req.body;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Prodotto non trovato' });
      }

      // Handle new uploaded images
      let immagini = product.immagini || [];
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        immagini = [...immagini, ...newImages];
      }

      const productData = {
        nome: nome || product.nome,
        descrizione: descrizione || product.descrizione,
        taglia: taglia || product.taglia,
        marca: marca || product.marca,
        condizione: condizione || product.condizione,
        prezzo: prezzo ? parseFloat(prezzo) : product.prezzo,
        immagini,
        disponibile: disponibile !== undefined ? disponibile === 'true' : product.disponibile
      };

      const updatedProduct = await Product.update(id, productData);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Errore nell\'aggiornamento del prodotto' });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Prodotto non trovato' });
      }

      // Delete associated images
      if (product.immagini && product.immagini.length > 0) {
        for (const imagePath of product.immagini) {
          try {
            const fullPath = path.join(process.cwd(), imagePath);
            await fs.unlink(fullPath);
          } catch (err) {
            console.warn('Could not delete image:', imagePath);
          }
        }
      }

      const deleted = await Product.delete(id);
      if (deleted) {
        res.json({ message: 'Prodotto eliminato con successo' });
      } else {
        res.status(500).json({ error: 'Errore nell\'eliminazione del prodotto' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Errore nell\'eliminazione del prodotto' });
    }
  }
}

export default ProductController;
