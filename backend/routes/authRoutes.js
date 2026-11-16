import express from 'express';
import {
  login,
  register,
  getMe,
  changePassword,
  updateProfile,
  resetPassword,
  socialLogin,
  verifyPass,
  linkSocial,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/social-login', socialLogin);
router.post('/register', register);
router.post('/reset-password', resetPassword);
router.get('/verify-pass/:code', verifyPass);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.put('/profile', protect, updateProfile);
router.post('/link-social', protect, linkSocial);

export default router;


