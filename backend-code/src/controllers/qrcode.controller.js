import QrCode from '../models/QrCode.model.js';

export const createQrCode = async (req, res, next) => {
  try {
    const { name, url, fgColor, bgColor, size } = req.body;
    const userId = req.user._id;

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    const qrCode = new QrCode({
      userId,
      name,
      url,
      fgColor: fgColor || '#000000',
      bgColor: bgColor || '#ffffff',
      size: size || 200,
    });

    await qrCode.save();

    res.status(201).json({
      message: 'QR code created successfully',
      qrCode: qrCode.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserQrCodes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const userId = req.user._id;

    const query = { userId, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [qrCodes, total] = await Promise.all([
      QrCode.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      QrCode.countDocuments(query),
    ]);

    res.json({
      qrCodes: qrCodes.map(qr => ({ ...qr, id: qr._id })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateQrCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, url, fgColor, bgColor, size } = req.body;
    const userId = req.user._id;

    const qrCode = await QrCode.findOne({ _id: id, userId, isActive: true });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    if (name) qrCode.name = name;
    if (url) qrCode.url = url;
    if (fgColor) qrCode.fgColor = fgColor;
    if (bgColor) qrCode.bgColor = bgColor;
    if (size) qrCode.size = size;

    await qrCode.save();

    res.json({
      message: 'QR code updated successfully',
      qrCode: qrCode.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQrCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const qrCode = await QrCode.findOne({ _id: id, userId });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    qrCode.isActive = false;
    await qrCode.save();

    res.json({ message: 'QR code deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getQrCodeCount = async (userId) => {
  return QrCode.countDocuments({ userId, isActive: true });
};
