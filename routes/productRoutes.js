import express from 'express';
import ProductController from '../controllers/productController.js';
import { authenticate } from '../middlewares/auth.js';
import { uploadImages, handleUploadError } from '../middlewares/upload.js';

const router = express.Router();

// Public routes
router.get('/', ProductController.getAllProducts);

// Sposta questa rotta qui, prima di :id
router.get('/my', authenticate, ProductController.getMyProducts);

router.get('/:id', ProductController.getProductById);

// Protected routes
router.post('/', authenticate, uploadImages, handleUploadError, ProductController.createProduct);
router.put('/:id', authenticate, uploadImages, handleUploadError, ProductController.updateProduct);
router.delete('/:id', authenticate, ProductController.deleteProduct);

export default router;
