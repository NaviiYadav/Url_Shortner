import { Router } from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  updateNotificationSettings,
  getNotificationSettings,
  googleAuth,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateSignup, validateLogin, validateProfileUpdate } from '../middleware/validate.middleware.js';

const router = Router();

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/google', googleAuth);

// Protected routes
router.use(authenticate);
router.get('/me', getMe);
router.post('/logout', logout);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/password', changePassword);
router.get('/notifications', getNotificationSettings);
router.put('/notifications', updateNotificationSettings);

export default router;
