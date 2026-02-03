import { Router } from 'express';
import {
  createShortUrl,
  getUserUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getUrlStats,
  getUserStats,
} from '../controllers/url.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateUrl } from '../middleware/validate.middleware.js';

const router = Router();

// All URL routes require authentication
router.use(authenticate);

// URL operations
router.post('/shorten', validateUrl, createShortUrl);
router.get('/', getUserUrls);
router.get('/stats', getUserStats);
router.get('/:id', getUrlById);
router.get('/:id/stats', getUrlStats);
router.put('/:id', updateUrl); // Update URL (change long URL, keep short code)
router.delete('/:id', deleteUrl);

export default router;
