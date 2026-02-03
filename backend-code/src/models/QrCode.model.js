import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'QR code name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    maxlength: [2048, 'URL cannot exceed 2048 characters'],
  },
  fgColor: {
    type: String,
    default: '#000000',
  },
  bgColor: {
    type: String,
    default: '#ffffff',
  },
  size: {
    type: Number,
    default: 200,
  },
  isActive: {
    type: Boolean,
    default: true,
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

const QrCode = mongoose.model('QrCode', qrCodeSchema);

export default QrCode;
