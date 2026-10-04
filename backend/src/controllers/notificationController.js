import { dbStore } from '../store/inMemoryStore.js';
import { isDbConnected } from '../config/db.js';
import { Notification } from '../models/schemas.js';

export const getMyNotifications = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (isDbConnected()) {
      const notifications = await Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .lean();
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return res.json({
        success: true,
        notifications,
        unreadCount,
      });
    }

    const notifications = dbStore.getNotificationsByUserId(req.user.id);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;

    if (isDbConnected()) {
      const updated = await Notification.findOneAndUpdate(
        { id, userId: req.user.id },
        { $set: { isRead: true } },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      return res.json({ success: true, message: 'Notification marked as read' });
    }

    const success = dbStore.markNotificationRead(id, req.user.id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (isDbConnected()) {
      const result = await Notification.updateMany(
        { userId: req.user.id, isRead: false },
        { $set: { isRead: true } }
      );
      return res.json({
        success: true,
        message: `Marked ${result.modifiedCount || 0} notifications as read`,
      });
    }

    const count = dbStore.markAllNotificationsRead(req.user.id);
    res.json({ success: true, message: `Marked ${count} notifications as read` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await Notification.findOneAndDelete({ id, userId: req.user.id });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      return res.json({ success: true, message: 'Notification dismissed' });
    }

    const deleted = dbStore.deleteNotification(id, req.user.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.json({ success: true, message: 'Notification dismissed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};
