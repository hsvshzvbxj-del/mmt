import { Router } from 'express';
import pool from '../db/index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, city, industry, specialization, experience } = req.query;
    let query = `SELECT id, name, city, specialization, experience, industry, company, linkedin, bio, avatar_url, role, created_at 
                 FROM users WHERE status = 'active'`;
    const params: any[] = [];
    let paramIdx = 1;

    if (name) { query += ` AND name ILIKE $${paramIdx++}`; params.push(`%${name}%`); }
    if (city) { query += ` AND city ILIKE $${paramIdx++}`; params.push(`%${city}%`); }
    if (industry) { query += ` AND industry ILIKE $${paramIdx++}`; params.push(`%${industry}%`); }
    if (specialization) { query += ` AND specialization ILIKE $${paramIdx++}`; params.push(`%${specialization}%`); }
    if (experience) { query += ` AND experience = $${paramIdx++}`; params.push(experience); }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', async (_req, res) => {
  try {
    const [members, events, opportunities, articles] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE status = 'active'"),
      pool.query('SELECT COUNT(*) FROM events'),
      pool.query("SELECT COUNT(*) FROM opportunities WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) FROM articles WHERE is_published = true"),
    ]);
    res.json({
      members: parseInt(members.rows[0].count),
      events: parseInt(events.rows[0].count),
      opportunities: parseInt(opportunities.rows[0].count),
      articles: parseInt(articles.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: get all members including suspended (must be before /:id)
router.get('/admin/all', authenticate, requireRole('admin', 'moderator'), async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, city, specialization, experience, industry, company, linkedin, role, status, created_at 
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: update member status or role
router.put('/admin/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status, role } = req.body;
    const result = await pool.query(
      `UPDATE users SET status=$1, role=$2, updated_at=NOW() WHERE id=$3 
       RETURNING id, name, email, role, status`,
      [status, role, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: delete member
router.delete('/admin/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, city, specialization, experience, industry, company, linkedin, bio, website, skills, avatar_url, role, created_at 
       FROM users WHERE id = $1 AND status = 'active'`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Member not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
