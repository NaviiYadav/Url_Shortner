import { Router } from 'express';
import { redirectToOriginal, getUrlInfo } from '../controllers/redirect.controller.js';

const router = Router();

// Get URL info without redirecting
router.get('/info/:shortCode', getUrlInfo);

// Redirect to original URL (must be last to catch all short codes)
router.get('/:shortCode', redirectToOriginal);

export default router;
