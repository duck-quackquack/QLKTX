import express from 'express';
import {
  getViolations,
  getMyViolations,
  getViolationById,
  createViolation,
  updateViolationStatus,
  deleteViolation,
} from '../controllers/violationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyViolations);
router.get('/', authorize('Admin', 'Staff'), getViolations);
router.get('/:id', getViolationById);
router.post('/', authorize('Admin', 'Staff'), createViolation);
router.put('/:id/status', authorize('Admin', 'Staff'), updateViolationStatus);
router.delete('/:id', authorize('Admin', 'Staff'), deleteViolation);

export default router;

