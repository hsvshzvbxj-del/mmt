import { Router } from 'express';
import { User } from '../models/User';
import { MembershipRequest } from '../models/MembershipRequest';
import { Event } from '../models/Event';
import { Opportunity } from '../models/Opportunity';
import { Discussion } from '../models/Discussion';
import { Article } from '../models/Article';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, requireRole('admin', 'moderator'), async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalMembers, newMembers, pendingApps, totalEvents, totalOpportunities, totalDiscussions, totalArticles, recentMembers, recentApplications] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'active', createdAt: { $gte: thirtyDaysAgo } }),
      MembershipRequest.countDocuments({ status: 'pending' }),
      Event.countDocuments(),
      Opportunity.countDocuments({ status: 'active' }),
      Discussion.countDocuments(),
      Article.countDocuments({ isPublished: true }),
      User.find({ status: 'active' }).select('name email city specialization createdAt').sort({ createdAt: -1 }).limit(5),
      MembershipRequest.find().select('fullName email city specialization status createdAt').sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      stats: { totalMembers, newMembers, pendingApplications: pendingApps, totalEvents, totalOpportunities, totalDiscussions, totalArticles },
      recentMembers,
      recentApplications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
