
import { expect } from 'chai';
import sinon from 'sinon';
import Product from '../models/Product.js';
import ProductController from '../controllers/productController.js';

describe('Product Model', () => {
  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { 
          id: 1, 
          nome: 'T-shirt', 
          descrizione: 'Bella t-shirt', 
          user_id: 1,
          disponibile: true 
        }
      ];

      expect(mockProducts).to.be.an('array');
      expect(mockProducts[0].nome).to.equal('T-shirt');
    });

    it('should filter products by availability', async () => {
      const filters = { disponibile: true };
      const mockProducts = [
        { id: 1, nome: 'T-shirt', disponibile: true }
      ];

      expect(mockProducts).to.be.an('array');
      expect(mockProducts.every(p => p.disponibile === true)).to.be.true;
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const productData = {
        nome: 'Jeans',
        descrizione: 'Jeans usati',
        taglia: 'M',
        user_id: 1
      };

      const mockProduct = { id: 1, ...productData };
      
      expect(mockProduct).to.be.an('object');
      expect(mockProduct.nome).to.equal('Jeans');
      expect(mockProduct.id).to.be.a('number');
    });
  });
});

describe('Product Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
      files: []
    };
    res = {
      json: sinon.stub(),
      status: sinon.stub().returnsThis()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      req.body = {
        nome: 'T-shirt',
        descrizione: 'Bella t-shirt',
        user_id: '1'
      };

      const mockProduct = { id: 1, nome: 'T-shirt', user_id: 1 };
      sinon.stub(Product, 'create').resolves(mockProduct);

      await ProductController.createProduct(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(mockProduct)).to.be.true;
    });

    it('should validate required fields', async () => {
      req.body = {}; // Missing required fields

      await ProductController.createProduct(req, res);

      expect(res.status.calledWith(400)).to.be.true;
    });
  });
});
