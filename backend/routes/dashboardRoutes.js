import express from 'express';
import { getStatistics } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/statistics', authorize('Admin', 'Staff'), getStatistics);

export default router;

