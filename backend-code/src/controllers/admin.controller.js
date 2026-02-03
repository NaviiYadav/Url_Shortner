import User from '../models/User.model.js';
import Url from '../models/Url.model.js';
import Click from '../models/Click.model.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      activeUsers,
      totalUrls,
      urlsThisMonth,
      urlsLastMonth,
      totalClicks,
      clicksThisMonth,
      clicksLastMonth,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Url.countDocuments({ isActive: true }),
      Url.countDocuments({ isActive: true, createdAt: { $gte: startOfMonth } }),
      Url.countDocuments({ isActive: true, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Click.countDocuments(),
      Click.countDocuments({ timestamp: { $gte: startOfMonth } }),
      Click.countDocuments({ timestamp: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const usersGrowth = usersLastMonth === 0 ? 100 : ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;
    const urlsGrowth = urlsLastMonth === 0 ? 100 : ((urlsThisMonth - urlsLastMonth) / urlsLastMonth) * 100;
    const clicksGrowth = clicksLastMonth === 0 ? 100 : ((clicksThisMonth - clicksLastMonth) / clicksLastMonth) * 100;

    res.json({
      totalUsers,
      activeUsers,
      usersThisMonth,
      usersGrowth: Math.round(usersGrowth * 10) / 10,
      totalUrls,
      urlsThisMonth,
      urlsGrowth: Math.round(urlsGrowth * 10) / 10,
      totalClicks,
      clicksThisMonth,
      clicksGrowth: Math.round(clicksGrowth * 10) / 10,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminChartData = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [clicksByDay, urlsByDay, usersByDay] = await Promise.all([
      Click.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Url.aggregate([
        { $match: { createdAt: { $gte: startDate }, isActive: true } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            urls: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            users: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge data by date
    const dateMap = new Map();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, { date: dateStr, clicks: 0, urls: 0, users: 0 });
    }

    clicksByDay.forEach(d => {
      if (dateMap.has(d._id)) {
        dateMap.get(d._id).clicks = d.clicks;
      }
    });

    urlsByDay.forEach(d => {
      if (dateMap.has(d._id)) {
        dateMap.get(d._id).urls = d.urls;
      }
    });

    usersByDay.forEach(d => {
      if (dateMap.has(d._id)) {
        dateMap.get(d._id).users = d.users;
      }
    });

    const chartData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ chartData });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    // Get URL and click counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [urlCount, clickCount] = await Promise.all([
          Url.countDocuments({ userId: user._id, isActive: true }),
          Click.countDocuments({ userId: user._id }),
        ]);
        return {
          ...user,
          id: user._id,
          urlCount,
          clickCount,
        };
      })
    );

    res.json({
      users: usersWithStats,
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

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from demoting themselves
    if (req.user._id.equals(user._id) && role && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

    res.json({
      message: 'User updated successfully',
      user: updatedUser.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.equals(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete - deactivate user
    user.isActive = false;
    await user.save();

    // Deactivate all user's URLs
    await Url.updateMany({ userId: id }, { isActive: false });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllUrls = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', userId = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (userId) {
      query.userId = userId;
    }

    const [urls, total] = await Promise.all([
      Url.find(query)
        .populate('userId', 'name email')
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
      user: url.userId,
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

export const deleteUrlAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const url = await Url.findById(id);
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    url.isActive = false;
    await url.save();

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [urls, totalClicks, clicksByDay] = await Promise.all([
      Url.find({ userId: id, isActive: true }).lean(),
      Click.countDocuments({ userId: id }),
      Click.aggregate([
        { $match: { userId: user._id, timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      user: user.toJSON(),
      stats: {
        totalUrls: urls.length,
        totalClicks,
        clicksByDay: clicksByDay.map(d => ({ date: d._id, clicks: d.clicks })),
      },
      urls: urls.map(url => ({
        ...url,
        id: url._id,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      })),
    });
  } catch (error) {
    next(error);
  }
};
