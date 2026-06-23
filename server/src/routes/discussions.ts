import { Router } from 'express';
import pool from '../db/index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { tag } = req.query;
    let query = `
      SELECT d.*, u.name as author_name, u.avatar_url as author_avatar, u.specialization as author_specialization,
        EXISTS(SELECT 1 FROM discussion_likes dl WHERE dl.discussion_id = d.id AND dl.user_id = $1) as is_liked,
        EXISTS(SELECT 1 FROM discussion_saves ds WHERE ds.discussion_id = d.id AND ds.user_id = $1) as is_saved
      FROM discussions d
      LEFT JOIN users u ON d.author_id = u.id
    `;
    const params: any[] = [req.user!.id];
    if (tag) {
      query += ` WHERE $2 = ANY(d.tags)`;
      params.push(tag);
    }
    query += ' ORDER BY d.is_pinned DESC, d.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const discussion = await pool.query(`
      SELECT d.*, u.name as author_name, u.avatar_url as author_avatar, u.specialization as author_specialization,
        EXISTS(SELECT 1 FROM discussion_likes dl WHERE dl.discussion_id = d.id AND dl.user_id = $2) as is_liked,
        EXISTS(SELECT 1 FROM discussion_saves ds WHERE ds.discussion_id = d.id AND ds.user_id = $2) as is_saved
      FROM discussions d
      LEFT JOIN users u ON d.author_id = u.id
      WHERE d.id = $1
    `, [req.params.id, req.user!.id]);

    if (!discussion.rows[0]) return res.status(404).json({ error: 'Discussion not found' });

    const comments = await pool.query(`
      SELECT c.*, u.name as author_name, u.avatar_url as author_avatar
      FROM comments c LEFT JOIN users u ON c.author_id = u.id
      WHERE c.discussion_id = $1 ORDER BY c.created_at ASC
    `, [req.params.id]);

    res.json({ ...discussion.rows[0], comments: comments.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

    const result = await pool.query(
      `INSERT INTO discussions (title, content, tags, author_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, content, tags || [], req.user!.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT author_id FROM discussions WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    if (result.rows[0].author_id !== req.user!.id && !['admin', 'moderator'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await pool.query('DELETE FROM discussions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/unlike
router.post('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const existing = await pool.query(
      'SELECT id FROM discussion_likes WHERE discussion_id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM discussion_likes WHERE discussion_id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
      await pool.query('UPDATE discussions SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1', [req.params.id]);
      res.json({ liked: false });
    } else {
      await pool.query('INSERT INTO discussion_likes (discussion_id, user_id) VALUES ($1, $2)', [req.params.id, req.user!.id]);
      await pool.query('UPDATE discussions SET likes_count = likes_count + 1 WHERE id = $1', [req.params.id]);
      res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save/unsave
router.post('/:id/save', authenticate, async (req: AuthRequest, res) => {
  try {
    const existing = await pool.query(
      'SELECT id FROM discussion_saves WHERE discussion_id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM discussion_saves WHERE discussion_id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
      res.json({ saved: false });
    } else {
      await pool.query('INSERT INTO discussion_saves (discussion_id, user_id) VALUES ($1, $2)', [req.params.id, req.user!.id]);
      res.json({ saved: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment
router.post('/:id/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const result = await pool.query(
      'INSERT INTO comments (discussion_id, author_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, req.user!.id, content]
    );
    await pool.query('UPDATE discussions SET comments_count = comments_count + 1 WHERE id = $1', [req.params.id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
