  import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
  addProductReview,
  getProductReviews
} from '../../controller/products/products.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);

// Protected routes
router.post('/create', protectedRoutes, createProduct);
router.put('/:id', protectedRoutes, updateProduct);
router.delete('/:id', protectedRoutes, deleteProduct);
router.post('/:id/review', protectedRoutes, addProductReview);

export default router;
