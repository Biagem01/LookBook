
import Swap from '../models/Swap.js';
import Product from '../models/Product.js';

class SwapController {
  static async getAllSwaps(req, res) {
    try {
      const { user_id, stato, dateFrom, dateTo } = req.query;
      
      const filters = {};
      if (user_id) filters.user_id = parseInt(user_id);
      if (stato) filters.stato = stato;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const swaps = await Swap.findAll(filters);
      res.json(swaps);
    } catch (error) {
      console.error('Error fetching swaps:', error);
      res.status(500).json({ error: 'Errore nel recuperare gli scambi' });
    }
  }

  static async getSwapById(req, res) {
    try {
      const { id } = req.params;
      const swap = await Swap.findById(id);
      
      if (!swap) {
        return res.status(404).json({ error: 'Scambio non trovato' });
      }
      
      res.json(swap);
    } catch (error) {
      console.error('Error fetching swap:', error);
      res.status(500).json({ error: 'Errore nel recuperare lo scambio' });
    }
  }

  static async createSwap(req, res) {
    try {
      const { user_richiedente_id, product_richiesto_id, product_offerto_id, messaggio } = req.body;

      if (!user_richiedente_id || !product_richiesto_id || !product_offerto_id) {
        return res.status(400).json({ error: 'user_richiedente_id, product_richiesto_id e product_offerto_id sono obbligatori' });
      }

      // Verify products exist and get owner of requested product
      const productRichiesto = await Product.findById(product_richiesto_id);
      const productOfferto = await Product.findById(product_offerto_id);

      if (!productRichiesto || !productOfferto) {
        return res.status(404).json({ error: 'Uno o entrambi i prodotti non esistono' });
      }

      if (!productRichiesto.disponibile || !productOfferto.disponibile) {
        return res.status(400).json({ error: 'Uno o entrambi i prodotti non sono disponibili' });
      }

      const swapData = {
        user_richiedente_id: parseInt(user_richiedente_id),
        user_proprietario_id: productRichiesto.user_id,
        product_richiesto_id: parseInt(product_richiesto_id),
        product_offerto_id: parseInt(product_offerto_id),
        messaggio
      };

      const swap = await Swap.create(swapData);
      res.status(201).json(swap);
    } catch (error) {
      console.error('Error creating swap:', error);
      res.status(500).json({ error: 'Errore nella creazione dello scambio' });
    }
  }

  static async updateSwapStatus(req, res) {
    try {
      const { id } = req.params;
      const { stato } = req.body;

      if (!stato || !['pending', 'accepted', 'rejected', 'completed'].includes(stato)) {
        return res.status(400).json({ error: 'Stato non valido' });
      }

      const swap = await Swap.findById(id);
      if (!swap) {
        return res.status(404).json({ error: 'Scambio non trovato' });
      }

      // If swap is accepted or completed, mark products as unavailable
      if (stato === 'accepted' || stato === 'completed') {
        await Product.update(swap.product_richiesto_id, { disponibile: false });
        await Product.update(swap.product_offerto_id, { disponibile: false });
      } else if (stato === 'rejected' && swap.stato === 'accepted') {
        // If rejecting a previously accepted swap, make products available again
        await Product.update(swap.product_richiesto_id, { disponibile: true });
        await Product.update(swap.product_offerto_id, { disponibile: true });
      }

      const updatedSwap = await Swap.updateStatus(id, stato);
      res.json(updatedSwap);
    } catch (error) {
      console.error('Error updating swap status:', error);
      res.status(500).json({ error: 'Errore nell\'aggiornamento dello stato dello scambio' });
    }
  }

  static async deleteSwap(req, res) {
    try {
      const { id } = req.params;

      const swap = await Swap.findById(id);
      if (!swap) {
        return res.status(404).json({ error: 'Scambio non trovato' });
      }

      // If swap was accepted, make products available again
      if (swap.stato === 'accepted') {
        await Product.update(swap.product_richiesto_id, { disponibile: true });
        await Product.update(swap.product_offerto_id, { disponibile: true });
      }

      const deleted = await Swap.delete(id);
      if (deleted) {
        res.json({ message: 'Scambio eliminato con successo' });
      } else {
        res.status(500).json({ error: 'Errore nell\'eliminazione dello scambio' });
      }
    } catch (error) {
      console.error('Error deleting swap:', error);
      res.status(500).json({ error: 'Errore nell\'eliminazione dello scambio' });
    }
  }
}

export default SwapController;
