import { Router } from 'express';
import {
  getAdminStats,
  getAdminChartData,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllUrls,
  deleteUrlAdmin,
  getUserAnalytics,
} from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getAdminStats);
router.get('/charts', getAdminChartData);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id/analytics', getUserAnalytics);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// URL management
router.get('/urls', getAllUrls);
router.delete('/urls/:id', deleteUrlAdmin);

export default router;
