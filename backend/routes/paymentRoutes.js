import express from 'express';
import {
  getPayments,
  getMyPayments,
  getPaymentById,
  recordPayment,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyPayments);
router.get('/', authorize('Admin', 'Staff'), getPayments);
router.get('/:id', getPaymentById);
router.post('/', authorize('Admin', 'Staff'), recordPayment);

export default router;

