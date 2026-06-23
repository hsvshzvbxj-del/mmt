import { Router } from 'express';
import pool from '../db/index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = `SELECT a.*, u.name as author_name, u.avatar_url as author_avatar 
                 FROM articles a LEFT JOIN users u ON a.author_id = u.id 
                 WHERE a.is_published = true`;
    const params: any[] = [];
    if (category) { query += ` AND a.category = $1`; params.push(category); }
    query += ' ORDER BY a.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as author_name, u.avatar_url as author_avatar 
       FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Article not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireRole('admin', 'moderator'), async (req: AuthRequest, res) => {
  try {
    const { title, content, cover_image, category } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

    const result = await pool.query(
      `INSERT INTO articles (title, content, cover_image, category, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, cover_image, category, req.user!.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { title, content, cover_image, category, is_published } = req.body;
    const result = await pool.query(
      `UPDATE articles SET title=$1, content=$2, cover_image=$3, category=$4, is_published=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [title, content, cover_image, category, is_published, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Article not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    await pool.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
