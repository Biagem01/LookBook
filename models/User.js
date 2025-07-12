
import { getDB } from '../config/database.js';

class User {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.cognome = data.cognome;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll() {
    const db = getDB();
    const [rows] = await db.execute(
      'SELECT id, nome, cognome, email, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows.map(row => new User(row));
  }

  static async findById(id) {
    const db = getDB();
    const [rows] = await db.execute(
      'SELECT id, nome, cognome, email, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  static async findByEmail(email) {
    const db = getDB();
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  static async create(userData) {
    const db = getDB();
    const { nome, cognome, email, password_hash } = userData;
    
    const [result] = await db.execute(
      'INSERT INTO users (nome, cognome, email, password_hash) VALUES (?, ?, ?, ?)',
      [nome, cognome, email, password_hash]
    );

    return await User.findById(result.insertId);
  }

  static async update(id, userData) {
    const db = getDB();
    const { nome, cognome, email } = userData;
    
    await db.execute(
      'UPDATE users SET nome = ?, cognome = ?, email = ? WHERE id = ?',
      [nome, cognome, email, id]
    );

    return await User.findById(id);
  }

  static async delete(id) {
    const db = getDB();
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default User;
