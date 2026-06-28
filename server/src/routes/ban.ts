import { Router } from 'express';
import { User } from '../models/User';
import { authenticate, requireRole, logAudit, AuthRequest } from '../middleware/auth';

const router = Router();

const ADMIN_ROLES = ['super_admin', 'admin', 'moderator', 'senior_moderator'];

router.post('/ban/:userId', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { banType = 'permanent', reason, durationDays, notes } = req.body;

    if (!reason?.trim()) return res.status(400).json({ error: 'سبب الحظر مطلوب' });

    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ error: 'المستخدم غير موجود' });
    if (target.role === 'super_admin') return res.status(403).json({ error: 'لا يمكن حظر المدير الأعلى' });

    const now = new Date();
    const expiresAt = banType === 'temporary' && durationDays
      ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
      : undefined;

    const historyEntry = {
      banType,
      reason: reason.trim(),
      bannedBy: req.user!.id,
      bannedAt: now,
      expiresAt,
    };

    await User.findByIdAndUpdate(userId, {
      status: banType === 'shadow' ? target.status : 'banned',
      'banInfo.isBanned': true,
      'banInfo.banType': banType,
      'banInfo.reason': reason.trim(),
      'banInfo.bannedBy': req.user!.id,
      'banInfo.bannedAt': now,
      'banInfo.expiresAt': expiresAt,
      'banInfo.appealStatus': 'none',
      $push: { 'banInfo.history': historyEntry },
    });

    await logAudit('user.ban', req.user!.id, {
      targetUserId: userId,
      details: { banType, reason, durationDays, notes },
      req,
    });

    res.json({ success: true, message: `تم حظر المستخدم (${banType})` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.post('/unban/:userId', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const lastHistory = target.banInfo?.history?.length
      ? target.banInfo.history[target.banInfo.history.length - 1]
      : null;

    if (lastHistory) {
      lastHistory.unbannedAt = new Date();
      (lastHistory as any).unbannedBy = req.user!.id;
    }

    await User.findByIdAndUpdate(userId, {
      status: 'active',
      'banInfo.isBanned': false,
      'banInfo.banType': undefined,
      'banInfo.reason': undefined,
      'banInfo.expiresAt': undefined,
      'banInfo.history': target.banInfo.history,
    });

    await logAudit('user.unban', req.user!.id, { targetUserId: userId, req });

    res.json({ success: true, message: 'تم رفع الحظر' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.post('/mute/:userId', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { reason, durationHours = 24 } = req.body;

    if (!reason?.trim()) return res.status(400).json({ error: 'سبب الكتم مطلوب' });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    await User.findByIdAndUpdate(userId, {
      'muteInfo.isMuted': true,
      'muteInfo.reason': reason.trim(),
      'muteInfo.mutedBy': req.user!.id,
      'muteInfo.mutedAt': now,
      'muteInfo.expiresAt': expiresAt,
    });

    await logAudit('user.mute', req.user!.id, { targetUserId: userId, details: { reason, durationHours }, req });

    res.json({ success: true, message: `تم كتم المستخدم لمدة ${durationHours} ساعة` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.post('/unmute/:userId', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      'muteInfo.isMuted': false,
      'muteInfo.reason': undefined,
      'muteInfo.expiresAt': undefined,
    });
    await logAudit('user.unmute', req.user!.id, { targetUserId: req.params.userId, req });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.post('/appeal/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user!.id !== req.params.userId) return res.status(403).json({ error: 'غير مصرح' });
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'نص الاستئناف مطلوب' });

    await User.findByIdAndUpdate(req.params.userId, {
      'banInfo.appealText': text.trim(),
      'banInfo.appealStatus': 'pending',
    });

    res.json({ success: true, message: 'تم إرسال طلب الاستئناف' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/history/:userId', authenticate, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name email banInfo muteInfo')
      .populate('banInfo.bannedBy', 'name')
      .populate('banInfo.history.bannedBy', 'name');
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json({ name: user.name, email: user.email, banInfo: user.banInfo, muteInfo: user.muteInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/appeals', authenticate, requireRole(...ADMIN_ROLES), async (_req, res) => {
  try {
    const users = await User.find({ 'banInfo.appealStatus': 'pending' })
      .select('name email banInfo createdAt')
      .sort({ 'banInfo.bannedAt': -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.put('/appeal/:userId', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res) => {
  try {
    const { decision } = req.body;
    if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ error: 'قرار غير صالح' });

    const update: any = { 'banInfo.appealStatus': decision };
    if (decision === 'approved') {
      update['banInfo.isBanned'] = false;
      update['status'] = 'active';
    }

    await User.findByIdAndUpdate(req.params.userId, update);
    await logAudit('user.unban', req.user!.id, { targetUserId: req.params.userId, details: { via: 'appeal', decision }, req });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
