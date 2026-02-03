import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Otp from '../models/Otp.model.js';
import { sendEmail } from '../services/email.service.js';

const OTP_EXPIRY_MINUTES = 10;

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Send verification OTP (during signup)
export const sendVerificationOtp = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email, type: 'verification' });

    // Generate new OTP
    const otpCode = Otp.generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save OTP
    await Otp.create({
      email,
      otp: otpCode,
      type: 'verification',
      expiresAt,
    });

    // Create or update unverified user
    if (existingUser) {
      existingUser.name = name;
      existingUser.password = password;
      await existingUser.save();
    } else {
      await User.create({
        name,
        email,
        password,
        isVerified: false,
      });
    }

    // Send email
    const emailResult = await sendEmail(email, 'verification', { otp: otpCode, name });
    
    if (!emailResult.success) {
      console.warn('Email sending failed, but OTP was created:', otpCode);
      // In development, you might want to return the OTP for testing
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({
          message: 'OTP generated (email sending failed in dev mode)',
          devOtp: otpCode, // Only in development!
        });
      }
    }

    res.status(200).json({
      message: 'Verification code sent to your email',
      expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP and complete signup
export const verifySignupOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({ email, type: 'verification' });
    
    if (!otpRecord) {
      return res.status(400).json({ error: 'No verification pending for this email' });
    }

    // Check if expired
    if (otpRecord.isExpired()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired. Please request a new one' });
    }

    // Check max attempts
    if (otpRecord.isMaxAttemptsReached()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'Too many failed attempts. Please request a new OTP' });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ 
        error: 'Invalid OTP',
        attemptsRemaining: 5 - otpRecord.attempts,
      });
    }

    // OTP is valid - verify user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    // Delete the OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification OTP
export const resendVerificationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Check rate limiting - don't allow resend within 1 minute
    const recentOtp = await Otp.findOne({ 
      email, 
      type: 'verification',
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
    });

    if (recentOtp) {
      return res.status(429).json({ error: 'Please wait before requesting a new OTP' });
    }

    // Delete old OTPs
    await Otp.deleteMany({ email, type: 'verification' });

    // Generate new OTP
    const otpCode = Otp.generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await Otp.create({
      email,
      otp: otpCode,
      type: 'verification',
      expiresAt,
    });

    // Send email
    await sendEmail(email, 'verification', { otp: otpCode, name: user.name });

    res.status(200).json({
      message: 'Verification code resent',
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (error) {
    next(error);
  }
};

// Request password reset
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a reset code' 
      });
    }

    // Rate limiting - don't allow multiple resets within 1 minute
    const recentOtp = await Otp.findOne({ 
      email, 
      type: 'password_reset',
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
    });

    if (recentOtp) {
      return res.status(429).json({ error: 'Please wait before requesting another reset code' });
    }

    // Delete old reset OTPs
    await Otp.deleteMany({ email, type: 'password_reset' });

    // Generate new OTP
    const otpCode = Otp.generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await Otp.create({
      email,
      otp: otpCode,
      type: 'password_reset',
      expiresAt,
    });

    // Send email
    const emailResult = await sendEmail(email, 'password_reset', { otp: otpCode, name: user.name });
    
    if (!emailResult.success && process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        message: 'Reset code generated (email sending failed in dev mode)',
        devOtp: otpCode,
      });
    }

    res.status(200).json({
      message: 'If an account exists with this email, you will receive a reset code',
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (error) {
    next(error);
  }
};

// Verify password reset OTP
export const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const otpRecord = await Otp.findOne({ email, type: 'password_reset' });
    
    if (!otpRecord) {
      return res.status(400).json({ error: 'No password reset pending for this email' });
    }

    if (otpRecord.isExpired()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired. Please request a new one' });
    }

    if (otpRecord.isMaxAttemptsReached()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'Too many failed attempts. Please request a new OTP' });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ 
        error: 'Invalid OTP',
        attemptsRemaining: 5 - otpRecord.attempts,
      });
    }

    // Mark as verified but don't delete yet
    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({
      message: 'OTP verified. You can now reset your password',
      verified: true,
    });
  } catch (error) {
    next(error);
  }
};

// Reset password with verified OTP
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const otpRecord = await Otp.findOne({ email, type: 'password_reset', verified: true });
    
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid or unverified OTP' });
    }

    if (otpRecord.isExpired()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    // Delete the OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      message: 'Password reset successfully. You can now login with your new password',
    });
  } catch (error) {
    next(error);
  }
};
