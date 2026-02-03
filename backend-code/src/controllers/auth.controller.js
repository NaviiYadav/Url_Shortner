import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { AppError } from '../middleware/error.middleware.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        error: 'Email not verified',
        needsVerification: true,
        email: user.email,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;
    
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // In a production app, you might want to blacklist the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// Update notification settings
export const updateNotificationSettings = async (req, res, next) => {
  try {
    const { email, push, weekly } = req.body;
    
    const updates = {
      'notifications.email': email ?? req.user.notifications?.email ?? true,
      'notifications.push': push ?? req.user.notifications?.push ?? false,
      'notifications.weekly': weekly ?? req.user.notifications?.weekly ?? true,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );

    res.json({
      message: 'Notification settings updated',
      notifications: user.notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Get notification settings
export const getNotificationSettings = async (req, res, next) => {
  try {
    res.json({
      notifications: req.user.notifications || { email: true, push: false, weekly: true },
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth login/signup
export const googleAuth = async (req, res, next) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Google ID and email are required' });
    }

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatar && !user.avatar) user.avatar = avatar;
        await user.save();
      }
      await user.updateLastLogin();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12), // Random password
        isVerified: true, // Google accounts are pre-verified
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Google login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
