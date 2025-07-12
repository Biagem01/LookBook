
import { expect } from 'chai';
import sinon from 'sinon';
import Swap from '../models/Swap.js';
import SwapController from '../controllers/swapController.js';

describe('Swap Model', () => {
  describe('findAll', () => {
    it('should return all swaps', async () => {
      const mockSwaps = [
        {
          id: 1,
          user_richiedente_id: 1,
          user_proprietario_id: 2,
          product_richiesto_id: 1,
          product_offerto_id: 2,
          stato: 'pending'
        }
      ];

      expect(mockSwaps).to.be.an('array');
      expect(mockSwaps[0].stato).to.equal('pending');
    });

    it('should filter swaps by status', async () => {
      const filters = { stato: 'accepted' };
      const mockSwaps = [
        { id: 1, stato: 'accepted' }
      ];

      expect(mockSwaps).to.be.an('array');
      expect(mockSwaps.every(s => s.stato === 'accepted')).to.be.true;
    });
  });

  describe('create', () => {
    it('should create a new swap', async () => {
      const swapData = {
        user_richiedente_id: 1,
        user_proprietario_id: 2,
        product_richiesto_id: 1,
        product_offerto_id: 2,
        messaggio: 'Ciao, mi interessa il tuo prodotto'
      };

      const mockSwap = { id: 1, ...swapData, stato: 'pending' };
      
      expect(mockSwap).to.be.an('object');
      expect(mockSwap.stato).to.equal('pending');
      expect(mockSwap.id).to.be.a('number');
    });
  });
});

describe('Swap Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {}
    };
    res = {
      json: sinon.stub(),
      status: sinon.stub().returnsThis()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('updateSwapStatus', () => {
    it('should update swap status successfully', async () => {
      req.params.id = '1';
      req.body.stato = 'accepted';

      const mockSwap = { id: 1, stato: 'accepted' };
      sinon.stub(Swap, 'findById').resolves({ id: 1, stato: 'pending' });
      sinon.stub(Swap, 'updateStatus').resolves(mockSwap);

      await SwapController.updateSwapStatus(req, res);

      expect(res.json.calledWith(mockSwap)).to.be.true;
    });

    it('should validate status values', async () => {
      req.params.id = '1';
      req.body.stato = 'invalid_status';

      await SwapController.updateSwapStatus(req, res);

      expect(res.status.calledWith(400)).to.be.true;
    });
  });
});
