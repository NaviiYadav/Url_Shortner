import express from "express";
import mongoose from "mongoose";
import Url from "../models/Url.model.js";
import Click from "../models/Click.model.js";

const router = express.Router();

// Utility
const getUserObjectId = (userId, res) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: "Invalid user id" });
    return null;
  }
  return new mongoose.Types.ObjectId(userId);
};

/**
 * USER OVERVIEW
 */
router.get("/overview/:userId", async (req, res) => {
  try {
    const userId = getUserObjectId(req.params.userId, res);
    if (!userId) return;

    const totalLinks = await Url.countDocuments({ userId });

    const totalClicksAgg = await Url.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$clicks" } } }
    ]);

    res.json({
      totalLinks,
      totalClicks: totalClicksAgg[0]?.total || 0
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch overview analytics" });
  }
});

/**
 * CLICKS PER DAY
 */
router.get("/clicks-per-day/:userId", async (req, res) => {
  try {
    const userId = getUserObjectId(req.params.userId, res);
    if (!userId) return;

    const data = await Click.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch click trends" });
  }
});

/**
 * DEVICES
 */
router.get("/devices/:userId", async (req, res) => {
  try {
    const userId = getUserObjectId(req.params.userId, res);
    if (!userId) return;

    const data = await Click.aggregate([
      { $match: { userId } },
      { $group: { _id: "$device", count: { $sum: 1 } } }
    ]);

    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch device analytics" });
  }
});

/**
 * BROWSERS
 */
router.get("/browsers/:userId", async (req, res) => {
  try {
    const userId = getUserObjectId(req.params.userId, res);
    if (!userId) return;

    const data = await Click.aggregate([
      { $match: { userId } },
      { $group: { _id: "$browser", count: { $sum: 1 } } }
    ]);

    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch browser analytics" });
  }
});

/**
 * REAL TOP COUNTRIES
 */
router.get("/countries/:userId", async (req, res) => {
  try {
    const userId = getUserObjectId(req.params.userId, res);
    if (!userId) return;

    const data = await Click.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$country",
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 5 }
    ]);

    const total = data.reduce((s, d) => s + d.clicks, 0) || 1;

    const formatted = data.map(d => ({
      country: d._id,
      clicks: d.clicks,
      percentage: Number(((d.clicks / total) * 100).toFixed(1))
    }));

    res.json(formatted);
  } catch {
    res.status(500).json({ error: "Failed to fetch countries analytics" });
  }
});

/**
 * REAL TOP REFERRERS
 */
router.get("/referrers/:userId", async (req, res) => {
  try {
    const userId = getUserObjectId(req.params.userId, res);
    if (!userId) return;

    const data = await Click.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$referrer",
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 4 }
    ]);

    const formatted = data.map(d => ({
      source: d._id || "Direct",
      clicks: d.clicks
    }));

    res.json(formatted);
  } catch {
    res.status(500).json({ error: "Failed to fetch referrer analytics" });
  }
});

/**
 * ADMIN OVERVIEW
 */
router.get("/admin/overview", async (req, res) => {
  try {
    const totalLinks = await Url.countDocuments();
    const activeLinks = await Url.countDocuments({ isActive: true });
    const totalClicks = await Click.countDocuments();

    res.json({
      totalLinks,
      activeLinks,
      totalClicks
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch admin analytics" });
  }
});

export default router;
