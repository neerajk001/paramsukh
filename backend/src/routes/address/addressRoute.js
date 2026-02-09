import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../../controller/address/address.controller.js';

const router = express.Router();

// All routes are protected
router.use(protectedRoutes);

router.get('/', getAddresses);
router.post('/add', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

export default router;
