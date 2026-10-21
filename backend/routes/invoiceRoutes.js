import express from 'express';
import {
  getInvoices,
  getMyInvoices,
  getInvoiceById,
  createInvoice,
  generateMonthlyInvoices,
  cancelInvoice,
} from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyInvoices);
router.get('/', authorize('Admin', 'Staff'), getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', authorize('Admin', 'Staff'), createInvoice);
router.post('/generate-monthly', authorize('Admin', 'Staff'), generateMonthlyInvoices);
router.put('/:id/cancel', authorize('Admin', 'Staff'), cancelInvoice);

export default router;

