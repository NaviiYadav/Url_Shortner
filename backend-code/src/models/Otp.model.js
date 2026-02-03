import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['verification', 'password_reset'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index - auto delete expired docs
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
otpSchema.index({ email: 1, type: 1 });

// Generate 6-digit OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Check if max attempts reached (max 5)
otpSchema.methods.isMaxAttemptsReached = function() {
  return this.attempts >= 5;
};

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
