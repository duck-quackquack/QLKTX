import express from 'express';
import {
  getContracts,
  getContractById,
  getMyActiveContract,
  getMyContracts,
  createContract,
  terminateContract,
  renewContract,
} from '../controllers/contractController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my-active', getMyActiveContract);
router.get('/my', getMyContracts);
router.get('/:id', getContractById);
router.get('/', authorize(1, 2), getContracts);

router.post('/', authorize(1, 2), createContract);
router.put('/:id/terminate', authorize(1, 2), terminateContract);
router.put('/:id/renew', authorize(1, 2), renewContract);

export default router;

