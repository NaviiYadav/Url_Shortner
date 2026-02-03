import { Router } from 'express';
import {
  sendVerificationOtp,
  verifySignupOtp,
  resendVerificationOtp,
  requestPasswordReset,
  verifyResetOtp,
  resetPassword,
} from '../controllers/otp.controller.js';
import { validateSignup } from '../middleware/validate.middleware.js';

const router = Router();

// Signup with OTP verification
router.post('/send-verification', validateSignup, sendVerificationOtp);
router.post('/verify-signup', verifySignupOtp);
router.post('/resend-verification', resendVerificationOtp);

// Password reset
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-reset', verifyResetOtp);
router.post('/reset-password', resetPassword);

export default router;
