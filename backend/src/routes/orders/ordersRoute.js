import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import {
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  requestReturn,
  trackOrder,
  getInvoice
} from '../../controller/orders/orders.controller.js';

const router = express.Router();

// All routes are protected
router.use(protectedRoutes);

router.post('/create', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderDetails);
router.patch('/:id/cancel', cancelOrder);
router.post('/:id/return', requestReturn);
router.get('/:id/track', trackOrder);
router.get('/:id/invoice', getInvoice);

export default router;
