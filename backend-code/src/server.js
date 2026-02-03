import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import otpRoutes from './routes/otp.routes.js';
import urlRoutes from './routes/url.routes.js';
import qrcodeRoutes from './routes/qrcode.routes.js';
import adminRoutes from './routes/admin.routes.js';
import redirectRoutes from './routes/redirect.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:5173"],
  credentials: true
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Increase JSON limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/qrcodes', qrcodeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', redirectRoutes); // Short URL redirects

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
