import { Router } from 'express';
import pool from '../db/index';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, requireRole('admin', 'moderator'), async (_req, res) => {
  try {
    const [totalMembers, newMembers, pendingApps, totalEvents, totalOpportunities, totalDiscussions, totalArticles] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) FROM users WHERE status = 'active' AND created_at > NOW() - INTERVAL '30 days'"),
      pool.query("SELECT COUNT(*) FROM membership_requests WHERE status = 'pending'"),
      pool.query('SELECT COUNT(*) FROM events'),
      pool.query("SELECT COUNT(*) FROM opportunities WHERE status = 'active'"),
      pool.query('SELECT COUNT(*) FROM discussions'),
      pool.query("SELECT COUNT(*) FROM articles WHERE is_published = true"),
    ]);

    const recentMembers = await pool.query(
      `SELECT id, name, email, city, specialization, created_at FROM users WHERE status = 'active' ORDER BY created_at DESC LIMIT 5`
    );
    const recentApplications = await pool.query(
      `SELECT id, full_name, email, city, specialization, status, created_at FROM membership_requests ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      stats: {
        totalMembers: parseInt(totalMembers.rows[0].count),
        newMembers: parseInt(newMembers.rows[0].count),
        pendingApplications: parseInt(pendingApps.rows[0].count),
        totalEvents: parseInt(totalEvents.rows[0].count),
        totalOpportunities: parseInt(totalOpportunities.rows[0].count),
        totalDiscussions: parseInt(totalDiscussions.rows[0].count),
        totalArticles: parseInt(totalArticles.rows[0].count),
      },
      recentMembers: recentMembers.rows,
      recentApplications: recentApplications.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
