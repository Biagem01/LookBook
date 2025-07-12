
import { getDB } from '../config/database.js';

class Product {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.descrizione = data.descrizione;
    this.taglia = data.taglia;
    this.marca = data.marca;
    this.condizione = data.condizione;
    this.prezzo = data.prezzo;
    this.immagini = typeof data.immagini === 'string' ? JSON.parse(data.immagini) : data.immagini;
    this.user_id = data.user_id;
    this.disponibile = data.disponibile;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(filters = {}) {
    const db = getDB();
    let query = `
      SELECT p.*, u.nome as user_nome, u.cognome as user_cognome 
      FROM products p 
      JOIN users u ON p.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.disponibile !== undefined) {
      query += ' AND p.disponibile = ?';
      params.push(filters.disponibile);
    }

    if (filters.user_id) {
      query += ' AND p.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.dateFrom) {
      query += ' AND p.created_at >= ?';
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      query += ' AND p.created_at <= ?';
      params.push(filters.dateTo);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows.map(row => new Product(row));
  }

  static async findById(id) {
    const db = getDB();
    const [rows] = await db.execute(
      `SELECT p.*, u.nome as user_nome, u.cognome as user_cognome 
       FROM products p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [id]
    );
    return rows.length > 0 ? new Product(rows[0]) : null;
  }

  static async create(productData) {
    const db = getDB();
    const { nome, descrizione, taglia, marca, condizione, prezzo, immagini, user_id } = productData;
    
    const [result] = await db.execute(
      `INSERT INTO products (nome, descrizione, taglia, marca, condizione, prezzo, immagini, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descrizione, taglia, marca, condizione, prezzo, JSON.stringify(immagini || []), user_id]
    );

    return await Product.findById(result.insertId);
  }

  static async update(id, productData) {
    const db = getDB();
    const { nome, descrizione, taglia, marca, condizione, prezzo, immagini, disponibile } = productData;
    
    await db.execute(
      `UPDATE products 
       SET nome = ?, descrizione = ?, taglia = ?, marca = ?, condizione = ?, prezzo = ?, immagini = ?, disponibile = ?
       WHERE id = ?`,
      [nome, descrizione, taglia, marca, condizione, prezzo, JSON.stringify(immagini || []), disponibile, id]
    );

    return await Product.findById(id);
  }

  static async delete(id) {
    const db = getDB();
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default Product;
