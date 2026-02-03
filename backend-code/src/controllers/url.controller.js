import { nanoid } from 'nanoid';
import Url from '../models/Url.model.js';
import Click from '../models/Click.model.js';

const SHORT_CODE_LENGTH = 7;

export const createShortUrl = async (req, res, next) => {
  try {
    const { url: originalUrl, customCode } = req.body;
    const userId = req.user._id;

    // Check if user already shortened this URL
    const existingUrl = await Url.findOne({ 
      userId, 
      originalUrl,
      isActive: true 
    });

    if (existingUrl) {
      return res.json({
        message: 'URL already shortened',
        url: {
          ...existingUrl.toJSON(),
          shortUrl: `${process.env.BASE_URL}/${existingUrl.shortCode}`,
        },
      });
    }

    // Generate or validate short code
    let shortCode;
    
    if (customCode) {
      // Validate custom code
      if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
        return res.status(400).json({ 
          error: 'Custom code can only contain letters, numbers, hyphens, and underscores' 
        });
      }
      
      if (customCode.length < 3 || customCode.length > 20) {
        return res.status(400).json({ 
          error: 'Custom code must be between 3 and 20 characters' 
        });
      }

      // Check if custom code is taken
      const existingCode = await Url.findOne({ shortCode: customCode });
      if (existingCode) {
        return res.status(400).json({ error: 'This custom code is already taken' });
      }
      
      shortCode = customCode;
    } else {
      // Generate unique short code
      let isUnique = false;
      while (!isUnique) {
        shortCode = nanoid(SHORT_CODE_LENGTH);
        const existing = await Url.findOne({ shortCode });
        if (!existing) isUnique = true;
      }
    }

    // Create URL
    const newUrl = new Url({
      originalUrl,
      shortCode,
      userId,
    });

    await newUrl.save();

    res.status(201).json({
      message: 'URL shortened successfully',
      url: {
        ...newUrl.toJSON(),
        shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserUrls = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const userId = req.user._id;

    const query = { userId, isActive: true };
    
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      Url.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Url.countDocuments(query),
    ]);

    const urlsWithShortUrl = urls.map(url => ({
      ...url,
      id: url._id,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
    }));

    res.json({
      urls: urlsWithShortUrl,
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

export const getUrlById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const url = await Url.findOne({ _id: id, userId });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({
      url: {
        ...url.toJSON(),
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update URL - allows user to change the long URL while keeping the same short code
export const updateUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { originalUrl } = req.body;
    const userId = req.user._id;

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const url = await Url.findOne({ _id: id, userId, isActive: true });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if user already has this URL shortened (to avoid duplicates)
    const existingUrl = await Url.findOne({
      userId,
      originalUrl,
      isActive: true,
      _id: { $ne: id }
    });

    if (existingUrl) {
      return res.status(400).json({ 
        error: 'You already have this URL shortened',
        existingUrl: {
          ...existingUrl.toJSON(),
          shortUrl: `${process.env.BASE_URL}/${existingUrl.shortCode}`,
        }
      });
    }

    // Update the URL
    url.originalUrl = originalUrl;
    url.updatedAt = new Date();
    await url.save();

    res.json({
      message: 'URL updated successfully',
      url: {
        ...url.toJSON(),
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const url = await Url.findOne({ _id: id, userId });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Soft delete
    url.isActive = false;
    await url.save();

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUrlStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const url = await Url.findOne({ _id: id, userId });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Get click analytics
    const [
      totalClicks,
      clicksByDay,
      clicksByDevice,
      clicksByBrowser,
      clicksByCountry,
      recentClicks,
    ] = await Promise.all([
      Click.countDocuments({ urlId: id }),
      Click.aggregate([
        { $match: { urlId: url._id } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
      Click.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
      ]),
      Click.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $limit: 10 },
      ]),
      Click.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Click.find({ urlId: url._id })
        .sort({ timestamp: -1 })
        .limit(20)
        .lean(),
    ]);

    res.json({
      url: {
        ...url.toJSON(),
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      },
      stats: {
        totalClicks,
        clicksByDay: clicksByDay.map(d => ({ date: d._id, clicks: d.clicks })),
        clicksByDevice: clicksByDevice.map(d => ({ device: d._id || 'unknown', count: d.count })),
        clicksByBrowser: clicksByBrowser.map(d => ({ browser: d._id || 'unknown', count: d.count })),
        clicksByCountry: clicksByCountry.map(d => ({ country: d._id || 'unknown', count: d.count })),
        recentClicks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUrls,
      urlsThisMonth,
      urlsLastMonth,
      totalClicks,
      clicksToday,
      clicksThisMonth,
      clicksLastMonth,
      clicksByDay,
    ] = await Promise.all([
      Url.countDocuments({ userId, isActive: true }),
      Url.countDocuments({ userId, isActive: true, createdAt: { $gte: startOfMonth } }),
      Url.countDocuments({ userId, isActive: true, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Click.countDocuments({ userId }),
      Click.countDocuments({ userId, timestamp: { $gte: startOfToday } }),
      Click.countDocuments({ userId, timestamp: { $gte: startOfMonth } }),
      Click.countDocuments({ userId, timestamp: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Click.aggregate([
        { $match: { userId, timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const urlsGrowth = urlsLastMonth === 0 ? 100 : ((urlsThisMonth - urlsLastMonth) / urlsLastMonth) * 100;
    const clicksGrowth = clicksLastMonth === 0 ? 100 : ((clicksThisMonth - clicksLastMonth) / clicksLastMonth) * 100;
    const avgCtr = totalUrls > 0 ? ((totalClicks / totalUrls) * 100 / 100).toFixed(1) : '0';

    // Fill in missing days for last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = clicksByDay.find(d => d._id === dateStr);
      chartData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        clicks: dayData ? dayData.clicks : 0,
      });
    }

    res.json({
      totalUrls,
      totalClicks,
      clicksToday,
      avgCtr,
      urlsThisMonth,
      clicksThisMonth,
      urlsGrowth: Math.round(urlsGrowth * 10) / 10,
      clicksGrowth: Math.round(clicksGrowth * 10) / 10,
      chartData,
    });
  } catch (error) {
    next(error);
  }
};
