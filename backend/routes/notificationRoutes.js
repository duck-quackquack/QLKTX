import express from 'express';
import {
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  createNotification,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllRead);
router.put('/:id/mark-read', markRead);
router.post('/', authorize('Admin', 'Staff'), createNotification);

export default router;

