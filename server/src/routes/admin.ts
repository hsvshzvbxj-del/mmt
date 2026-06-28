import { Router } from 'express';
import { User } from '../models/User';
import { MembershipRequest } from '../models/MembershipRequest';
import { Event } from '../models/Event';
import { Opportunity } from '../models/Opportunity';
import { Discussion } from '../models/Discussion';
import { Article } from '../models/Article';
import { AuditLog } from '../models/AuditLog';
import { Report } from '../models/Report';
import { authenticate, requireRole, logAudit, AuthRequest } from '../middleware/auth';

const router = Router();
const MOD_ROLES = ['super_admin', 'admin', 'moderator', 'senior_moderator'];

router.get('/dashboard', authenticate, requireRole(...MOD_ROLES), async (req: AuthRequest, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalMembers, newMembers, weeklyMembers,
      pendingApps, approvedApps, rejectedApps,
      totalEvents, totalOpportunities, totalDiscussions, totalArticles,
      totalBanned, totalMuted, totalSuspended,
      pendingReports, recentMembers, recentApplications,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'active', createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ status: 'active', createdAt: { $gte: sevenDaysAgo } }),
      MembershipRequest.countDocuments({ status: 'pending' }),
      MembershipRequest.countDocuments({ status: 'approved' }),
      MembershipRequest.countDocuments({ status: 'rejected' }),
      Event.countDocuments(),
      Opportunity.countDocuments({ status: 'active' }),
      Discussion.countDocuments(),
      Article.countDocuments({ isPublished: true }),
      User.countDocuments({ 'banInfo.isBanned': true }),
      User.countDocuments({ 'muteInfo.isMuted': true }),
      User.countDocuments({ status: 'suspended' }),
      Report.countDocuments({ status: 'pending' }),
      User.find({ status: 'active' }).select('name email city specialization createdAt avatarUrl role').sort({ createdAt: -1 }).limit(5),
      MembershipRequest.find().select('fullName email city specialization status createdAt').sort({ createdAt: -1 }).limit(5),
      AuditLog.find().populate('performedBy', 'name role').sort({ createdAt: -1 }).limit(10),
    ]);

    const growthByMonth: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(); start.setMonth(start.getMonth() - i); start.setDate(1); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setMonth(end.getMonth() + 1);
      const count = await User.countDocuments({ createdAt: { $gte: start, $lt: end } });
      growthByMonth.push({ month: start.toLocaleString('ar', { month: 'short', year: '2-digit' }), count });
    }

    res.json({
      stats: {
        totalMembers, newMembers, weeklyMembers,
        pendingApplications: pendingApps,
        approvedApplications: approvedApps,
        rejectedApplications: rejectedApps,
        totalEvents, totalOpportunities, totalDiscussions, totalArticles,
        totalBanned, totalMuted, totalSuspended,
        pendingReports,
      },
      growthByMonth,
      recentMembers,
      recentApplications,
      recentActivity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/members', authenticate, requireRole(...MOD_ROLES), async (req, res) => {
  try {
    const { status, role, search, page = 1, limit = 20 } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.put('/members/:id', authenticate, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { status, role } = req.body;
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const validRoles = ['super_admin', 'admin', 'moderator', 'senior_moderator', 'editor', 'reviewer', 'support', 'member', 'guest'];
    const validStatuses = ['active', 'inactive', 'pending', 'suspended', 'archived'];

    const update: any = {};
    if (status && validStatuses.includes(status)) update.status = status;
    if (role && validRoles.includes(role)) update.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');

    await logAudit('user.role_change', req.user!.id, {
      targetUserId: req.params.id,
      details: { oldRole: target.role, newRole: role, oldStatus: target.status, newStatus: status },
      req,
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.delete('/members/:id', authenticate, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'المستخدم غير موجود' });

    await User.findByIdAndDelete(req.params.id);
    await logAudit('user.delete', req.user!.id, { targetUserId: req.params.id, details: { name: target.name, email: target.email }, req });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/moderation', authenticate, requireRole(...MOD_ROLES), async (_req, res) => {
  try {
    const [pendingReports, flaggedDiscussions, bannedUsers, mutedUsers, pendingAppeals] = await Promise.all([
      Report.find({ status: 'pending' })
        .populate('reportedBy', 'name avatarUrl')
        .populate('targetUser', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .limit(20),
      Discussion.find({ isPinned: false }).sort({ createdAt: -1 }).limit(10).select('title authorId createdAt'),
      User.find({ 'banInfo.isBanned': true })
        .select('name email banInfo createdAt')
        .sort({ 'banInfo.bannedAt': -1 })
        .limit(20),
      User.find({ 'muteInfo.isMuted': true })
        .select('name email muteInfo createdAt')
        .sort({ 'muteInfo.mutedAt': -1 })
        .limit(20),
      User.find({ 'banInfo.appealStatus': 'pending' })
        .select('name email banInfo')
        .limit(10),
    ]);

    res.json({ pendingReports, flaggedDiscussions, bannedUsers, mutedUsers, pendingAppeals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/analytics', authenticate, requireRole(...MOD_ROLES), async (_req, res) => {
  try {
    const roleBreakdown = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const statusBreakdown = await User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const topSpecializations = await User.aggregate([
      { $match: { specialization: { $exists: true, $ne: '' } } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topCities = await User.aggregate([
      { $match: { city: { $exists: true, $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({ roleBreakdown, statusBreakdown, topSpecializations, topCities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
