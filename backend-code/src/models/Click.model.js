import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  referrer: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  ip: {
    type: String,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    default: null,
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown',
  },
  browser: {
    type: String,
    default: null,
  },
  os: {
    type: String,
    default: null,
  },
}, {
  timestamps: false,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for analytics queries
clickSchema.index({ urlId: 1, timestamp: -1 });
clickSchema.index({ userId: 1, timestamp: -1 });
clickSchema.index({ timestamp: -1 });

const Click = mongoose.model('Click', clickSchema);

export default Click;
