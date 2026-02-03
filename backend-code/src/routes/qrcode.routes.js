import { Router } from 'express';
import {
  createQrCode,
  getUserQrCodes,
  updateQrCode,
  deleteQrCode,
} from '../controllers/qrcode.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createQrCode);
router.get('/', getUserQrCodes);
router.put('/:id', updateQrCode);
router.delete('/:id', deleteQrCode);

export default router;
