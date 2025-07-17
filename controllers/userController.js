
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class UserController {
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Errore nel recuperare gli utenti' });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Errore nel recuperare l\'utente' });
    }
  }

  static async createUser(req, res) {
    try {
      const { nome, cognome, email, password } = req.body;

      // Validation
      if (!nome || !cognome || !email || !password) {
        return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email già registrata' });
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const user = await User.create({ nome, cognome, email, password_hash });
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      res.status(201).json({ user, token });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Errore nella creazione dell\'utente' });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { nome, cognome, email } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }

      const updatedUser = await User.update(id, { nome, cognome, email });
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Errore nell\'aggiornamento dell\'utente' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }

      const deleted = await User.delete(id);
      if (deleted) {
        res.json({ message: 'Utente eliminato con successo' });
      } else {
        res.status(500).json({ error: 'Errore nell\'eliminazione dell\'utente' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Errore nell\'eliminazione dell\'utente' });
    }
  }

  static async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e password sono obbligatori' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      // Remove password from response
      delete user.password_hash;
      
      res.json({ user, token });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'Errore nel login' });
    }
  }

static async getCurrentUser(req, res) {
  try {
    const user = req.user;

    // Rimuovi la password hash prima di restituirlo
    const { password_hash, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Errore nel recuperare l\'utente loggato:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
}

}

export default UserController;
