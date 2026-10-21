import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { getNextSequence } from '../models/Counter.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1, id: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.json({ success: true, data: count });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({
      id: Number(req.params.id),
      userId: req.user.id,
    });

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
    }

    notif.isRead = true;
    await notif.save();

    res.json({ success: true, message: 'Đã đánh dấu đã đọc', data: true });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc', data: true });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { userId, title, content, type, actionUrl } = req.body;

    if (!userId || userId === 0) {
      // Broadcast to all active users
      const users = await User.find({ isActive: true }).select('id');
      const docs = [];
      for (const u of users) {
        const id = await getNextSequence('notification_id');
        docs.push({
          id,
          userId: u.id,
          title,
          content,
          type: Number(type) || 1,
          actionUrl: actionUrl || '',
          isRead: false,
        });
      }
      if (docs.length > 0) {
        await Notification.insertMany(docs);
      }
      return res.status(201).json({
        success: true,
        message: `Đã gửi thông báo cho ${docs.length} người dùng`,
        data: docs[0],
      });
    }

    const id = await getNextSequence('notification_id');
    const notif = await Notification.create({
      id,
      userId: Number(userId),
      title,
      content,
      type: Number(type) || 1,
      actionUrl: actionUrl || '',
      isRead: false,
    });

    res.status(201).json({
      success: true,
      message: 'Gửi thông báo thành công',
      data: notif,
    });
  } catch (error) {
    next(error);
  }
};

