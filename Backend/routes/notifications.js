const express = require('express');
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const Notification = require('../models/notification');

// GET all notifications for a user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { isRead, type, limit = 20, skip = 0 } = req.query;

    let query = { recipientId: req.user._id };
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });

    res.status(200).json({
      notifications,
      total,
      unreadCount,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
});

// GET unread notifications count
router.get('/unread/count', requireAuth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: "Error fetching unread count", error: error.message });
  }
});

// GET a single notification
router.get('/:notificationId', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Mark as read
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.status(200).json({ notification });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ message: "Error fetching notification", error: error.message });
  }
});

// MARK notification as read
router.put('/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: "Error marking notification as read", error: error.message });
  }
});

// MARK all notifications as read
router.put('/read/all', requireAuth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: "Error marking notifications as read", error: error.message });
  }
});

// DELETE a notification
router.delete('/:notificationId', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: "Error deleting notification", error: error.message });
  }
});

// DELETE all read notifications
router.delete('/delete/read', requireAuth, async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipientId: req.user._id,
      isRead: true
    });

    res.status(200).json({
      message: "Read notifications deleted",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ message: "Error deleting notifications", error: error.message });
  }
});

module.exports = router;
