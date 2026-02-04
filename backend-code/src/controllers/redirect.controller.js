import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';
import Url from '../models/Url.model.js';
import Click from '../models/Click.model.js';

export const redirectToOriginal = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Fetch from database
    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    // Record click (async)
    recordClick(url, req).catch(err =>
      console.error('Click recording error:', err)
    );

    // Redirect immediately
    res.redirect(301, url.originalUrl);
  } catch (error) {
    next(error);
  }
};

// Async function to record click analytics
async function recordClick(url, req) {
  try {
    // Parse user agent
    const parser = new UAParser(req.headers['user-agent']);
    const uaResult = parser.getResult();

    // Device
    let device = 'desktop';
    if (uaResult.device.type === 'mobile') device = 'mobile';
    else if (uaResult.device.type === 'tablet') device = 'tablet';

    // Client IP
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress;

    // GeoIP lookup
    const geo = geoip.lookup(ip);
    const country = geo?.country || null;
    const city = geo?.city || null;

    // Save click
    await Click.create({
      urlId: url._id,
      userId: url.userId,
      referrer: req.headers.referer || null,
      userAgent: req.headers['user-agent'] || null,
      ip,
      country,
      city,
      device,
      browser: uaResult.browser.name || null,
      os: uaResult.os.name || null,
    });

    // Update click count
    await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });
  } catch (error) {
    console.error('Error recording click:', error);
  }
}

// Endpoint to get URL info without redirecting
export const getUrlInfo = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
    });
  } catch (error) {
    next(error);
  }
};
