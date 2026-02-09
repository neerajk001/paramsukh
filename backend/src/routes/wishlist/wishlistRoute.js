import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  clearWishlist
} from '../../controller/wishlist/wishlist.controller.js';

const router = express.Router();

// All routes are protected
router.use(protectedRoutes);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);
router.post('/move-to-cart/:productId', moveToCart);
router.delete('/clear', clearWishlist);

export default router;
