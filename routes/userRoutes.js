
import express from 'express';
import UserController from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', UserController.createUser);
router.post('/login', UserController.loginUser);

// Protected routes
router.get('/', authenticate, UserController.getAllUsers);
router.get('/:id', authenticate, UserController.getUserById);
router.put('/:id', authenticate, UserController.updateUser);
router.delete('/:id', authenticate, UserController.deleteUser);

export default router;
