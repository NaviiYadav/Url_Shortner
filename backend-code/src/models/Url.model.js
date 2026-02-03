import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true,
    maxlength: [2048, 'URL cannot exceed 2048 characters'],
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  metadata: {
    title: String,
    description: String,
    favicon: String,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual for full short URL
urlSchema.virtual('shortUrl').get(function() {
  return `${process.env.BASE_URL}/${this.shortCode}`;
});

// Compound index for checking existing URLs per user
urlSchema.index({ userId: 1, originalUrl: 1 });

// Index for efficient lookups
urlSchema.index({ shortCode: 1 });

const Url = mongoose.model('Url', urlSchema);

export default Url;
