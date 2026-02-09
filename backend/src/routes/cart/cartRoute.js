import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon
} from '../../controller/cart/cart.controller.js';

const router = express.Router();

// All routes are protected
router.use(protectedRoutes);

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/update/:itemId', updateCartItem);
router.delete('/remove/:itemId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/apply-coupon', applyCoupon);
router.delete('/remove-coupon', removeCoupon);

export default router;
