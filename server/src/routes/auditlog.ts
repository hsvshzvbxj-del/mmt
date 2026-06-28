import { Router } from 'express';
import { AuditLog } from '../models/AuditLog';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { action, userId, limit = 50, skip = 0 } = req.query;
    const filter: any = {};
    if (action) filter.action = action;
    if (userId) filter.$or = [{ performedBy: userId }, { targetUser: userId }];

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('performedBy', 'name email role')
        .populate('targetUser', 'name email')
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ logs, total, limit: Number(limit), skip: Number(skip) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/user/:userId', authenticate, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find({
      $or: [{ performedBy: req.params.userId }, { targetUser: req.params.userId }],
    })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
