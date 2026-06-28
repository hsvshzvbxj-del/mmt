import { Router } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// جلب الإشعارات (مع دعم الصفحات)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const { limit = 30, skip = 0, unread } = req.query;

    const filter: any = { userId };
    if (unread === 'true') filter.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('triggeredBy', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// تعليم إشعار واحد كمقروء
router.put('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// تعليم الكل كمقروء
router.put('/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user!.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// حذف إشعار
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// حذف كل الإشعارات
router.delete('/', authenticate, async (req: AuthRequest, res) => {
  try {
    await Notification.deleteMany({ userId: req.user!.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
