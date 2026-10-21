import express from 'express';
import {
  getRepairs,
  getMyRepairs,
  getRepairById,
  createRepair,
  updateRepairStatus,
} from '../controllers/repairController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyRepairs);
router.get('/', authorize('Admin', 'Staff'), getRepairs);
router.get('/:id', getRepairById);
router.post('/', createRepair);
router.put('/:id/status', authorize('Admin', 'Staff'), updateRepairStatus);

export default router;

