import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import {
  registerShop,
  getAllShops,
  getShopById,
  updateShop,
  getShopProducts,
  getShopReviews,
  addShopReview
} from '../../controller/shop/shop.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllShops);
router.get('/:id', getShopById);
router.get('/:id/products', getShopProducts);
router.get('/:id/reviews', getShopReviews);

// Protected routes
router.post('/register', protectedRoutes, registerShop);
router.put('/:id', protectedRoutes, updateShop);
router.post('/:id/review', protectedRoutes, addShopReview);

export default router;
