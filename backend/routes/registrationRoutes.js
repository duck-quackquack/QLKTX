import express from 'express';
import {
  getRegistrations,
  getMyRegistrations,
  getRegistrationById,
  submitRegistration,
  reviewRegistration,
  cancelRegistration,
} from '../controllers/registrationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyRegistrations);
router.get('/:id', getRegistrationById);
router.get('/', authorize(1, 2), getRegistrations);

router.post('/', submitRegistration);
router.put('/:id/review', authorize(1, 2), reviewRegistration);
router.put('/:id/cancel', cancelRegistration);

export default router;

