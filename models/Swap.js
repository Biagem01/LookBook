import { getDB } from '../config/database.js';

class Swap {
  constructor(data) {
    this.id = data.id;
    this.user_richiedente_id = data.user_richiedente_id;
    this.user_proprietario_id = data.user_proprietario_id;
    this.product_richiesto_id = data.product_richiesto_id;
    this.product_offerto_id = data.product_offerto_id;
    this.stato = data.stato;
    this.messaggio = data.messaggio;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;

    // Campi aggiuntivi per il frontend
    this.richiedente_nome = data.richiedente_nome;
    this.richiedente_cognome = data.richiedente_cognome;
    this.proprietario_nome = data.proprietario_nome;
    this.proprietario_cognome = data.proprietario_cognome;
    this.product_richiesto_nome = data.product_richiesto_nome;
    this.product_offerto_nome = data.product_offerto_nome;
  }

  toJSON() {
    return {
      id: this.id,
      user_richiedente_id: this.user_richiedente_id,
      user_proprietario_id: this.user_proprietario_id,
      product_richiesto_id: this.product_richiesto_id,
      product_offerto_id: this.product_offerto_id,
      stato: this.stato,
      messaggio: this.messaggio,
      created_at: this.created_at,
      updated_at: this.updated_at,
      richiedente_nome: this.richiedente_nome,
      richiedente_cognome: this.richiedente_cognome,
      proprietario_nome: this.proprietario_nome,
      proprietario_cognome: this.proprietario_cognome,
      product_richiesto_nome: this.product_richiesto_nome,
      product_offerto_nome: this.product_offerto_nome
    };
  }

  static async findAll(filters = {}) {
    const db = getDB();
    let query = `
      SELECT s.*, 
             ur.nome as richiedente_nome, ur.cognome as richiedente_cognome,
             up.nome as proprietario_nome, up.cognome as proprietario_cognome,
             pr.nome as product_richiesto_nome,
             po.nome as product_offerto_nome
      FROM swaps s
      JOIN users ur ON s.user_richiedente_id = ur.id
      JOIN users up ON s.user_proprietario_id = up.id
      JOIN products pr ON s.product_richiesto_id = pr.id
      JOIN products po ON s.product_offerto_id = po.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND (s.user_richiedente_id = ? OR s.user_proprietario_id = ?)';
      params.push(filters.user_id, filters.user_id);
    }

    if (filters.stato) {
      query += ' AND s.stato = ?';
      params.push(filters.stato);
    }

    if (filters.dateFrom) {
      query += ' AND s.created_at >= ?';
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      query += ' AND s.created_at <= ?';
      params.push(filters.dateTo);
    }

    query += ' ORDER BY s.created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows.map(row => new Swap(row));
  }

  static async findById(id) {
    const db = getDB();
    const [rows] = await db.execute(
      `SELECT s.*, 
             ur.nome as richiedente_nome, ur.cognome as richiedente_cognome,
             up.nome as proprietario_nome, up.cognome as proprietario_cognome,
             pr.nome as product_richiesto_nome,
             po.nome as product_offerto_nome
       FROM swaps s
       JOIN users ur ON s.user_richiedente_id = ur.id
       JOIN users up ON s.user_proprietario_id = up.id
       JOIN products pr ON s.product_richiesto_id = pr.id
       JOIN products po ON s.product_offerto_id = po.id
       WHERE s.id = ?`,
      [id]
    );
    return rows.length > 0 ? new Swap(rows[0]) : null;
  }

  static async create(swapData) {
    const db = getDB();
    const { user_richiedente_id, user_proprietario_id, product_richiesto_id, product_offerto_id, messaggio } = swapData;
    
    const [result] = await db.execute(
      `INSERT INTO swaps (user_richiedente_id, user_proprietario_id, product_richiesto_id, product_offerto_id, messaggio) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_richiedente_id, user_proprietario_id, product_richiesto_id, product_offerto_id, messaggio]
    );

    return await Swap.findById(result.insertId);
  }

static async updateStatus(id, stato) {
  const db = getDB();
  
  try {
    await db.execute('UPDATE swaps SET stato = ? WHERE id = ?', [stato, id]);
    return await Swap.findById(id);
  } catch (error) {
    console.error('Errore in updateStatus:', error);
    throw error;
  }
}


  static async delete(id) {
    const db = getDB();
    const [result] = await db.execute('DELETE FROM swaps WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default Swap;
