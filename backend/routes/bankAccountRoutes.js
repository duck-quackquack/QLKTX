import express from 'express';
import {
  getBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  setDefaultBankAccount,
  deleteBankAccount,
} from '../controllers/bankAccountController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getBankAccounts);
router.get('/:id', getBankAccountById);
router.post('/', authorize('Admin'), createBankAccount);
router.put('/:id', authorize('Admin'), updateBankAccount);
router.patch('/:id/default', authorize('Admin'), setDefaultBankAccount);
router.delete('/:id', authorize('Admin'), deleteBankAccount);

export default router;
