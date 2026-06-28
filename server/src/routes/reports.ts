import { Router } from 'express';
import { Report } from '../models/Report';
import { authenticate, requireRole, logAudit, AuthRequest } from '../middleware/auth';

const router = Router();
const MOD_ROLES = ['super_admin', 'admin', 'moderator', 'senior_moderator', 'reviewer'];

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { targetType, targetId, targetUser, type, description } = req.body;
    if (!targetType || !targetId || !type) {
      return res.status(400).json({ error: 'بيانات البلاغ ناقصة' });
    }

    const existing = await Report.findOne({
      reportedBy: req.user!.id,
      targetId,
      status: 'pending',
    });
    if (existing) return res.status(400).json({ error: 'أرسلت بلاغاً مسبقاً على هذا المحتوى' });

    const report = await Report.create({
      reportedBy: req.user!.id,
      targetType,
      targetId,
      targetUser,
      type,
      description: description?.trim(),
    });

    await logAudit('report.create', req.user!.id, {
      targetUserId: targetUser,
      details: { targetType, targetId, type },
      req,
    });

    res.status(201).json({ success: true, id: report._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/', authenticate, requireRole(...MOD_ROLES), async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const reports = await Report.find(filter)
      .populate('reportedBy', 'name avatarUrl')
      .populate('targetUser', 'name avatarUrl')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.put('/:id', authenticate, requireRole(...MOD_ROLES), async (req: AuthRequest, res) => {
  try {
    const { status, reviewNotes, action } = req.body;
    if (!['reviewing', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'حالة غير صالحة' });
    }

    const report = await Report.findByIdAndUpdate(req.params.id, {
      status,
      reviewNotes,
      action,
      reviewedBy: req.user!.id,
      resolvedAt: ['resolved', 'dismissed'].includes(status) ? new Date() : undefined,
    }, { new: true });

    if (!report) return res.status(404).json({ error: 'البلاغ غير موجود' });

    await logAudit('report.resolve', req.user!.id, {
      targetResourceId: req.params.id,
      details: { status, action },
      req,
    });

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/stats', authenticate, requireRole(...MOD_ROLES), async (_req, res) => {
  try {
    const [pending, reviewing, resolved, dismissed] = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'reviewing' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'dismissed' }),
    ]);
    res.json({ pending, reviewing, resolved, dismissed, total: pending + reviewing + resolved + dismissed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
