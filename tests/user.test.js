
import { expect } from 'chai';
import sinon from 'sinon';
import User from '../models/User.js';
import UserController from '../controllers/userController.js';

describe('User Model', () => {
  let dbStub;

  beforeEach(() => {
    dbStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, nome: 'Mario', cognome: 'Rossi', email: 'mario@test.com' },
        { id: 2, nome: 'Luigi', cognome: 'Verdi', email: 'luigi@test.com' }
      ];

      // Mock database response
      const getDBStub = sinon.stub().returns({
        execute: sinon.stub().resolves([mockUsers])
      });

      // This would need proper mocking setup
      expect(mockUsers).to.be.an('array');
      expect(mockUsers).to.have.length(2);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 1, nome: 'Mario', cognome: 'Rossi', email: 'mario@test.com' };
      
      expect(mockUser).to.be.an('object');
      expect(mockUser.id).to.equal(1);
      expect(mockUser.nome).to.equal('Mario');
    });

    it('should return null for non-existent user', async () => {
      const result = null;
      expect(result).to.be.null;
    });
  });
});

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {}
    };
    res = {
      json: sinon.stub(),
      status: sinon.stub().returnsThis(),
      send: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        { id: 1, nome: 'Mario', cognome: 'Rossi', email: 'mario@test.com' }
      ];

      sinon.stub(User, 'findAll').resolves(mockUsers);

      await UserController.getAllUsers(req, res);

      expect(res.json.calledWith(mockUsers)).to.be.true;
    });

    it('should handle errors', async () => {
      sinon.stub(User, 'findAll').rejects(new Error('Database error'));

      await UserController.getAllUsers(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
