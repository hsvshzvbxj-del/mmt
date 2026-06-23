import { Router } from 'express';
import pool from '../db/index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = `SELECT o.*, u.name as creator_name FROM opportunities o 
                 LEFT JOIN users u ON o.created_by = u.id WHERE o.status = 'active'`;
    const params: any[] = [];
    if (type) { query += ` AND o.type = $1`; params.push(type); }
    query += ' ORDER BY o.created_at DESC';
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
      `SELECT o.*, u.name as creator_name FROM opportunities o 
       LEFT JOIN users u ON o.created_by = u.id WHERE o.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireRole('admin', 'moderator'), async (req: AuthRequest, res) => {
  try {
    const { title, description, company, type, deadline } = req.body;
    const result = await pool.query(
      `INSERT INTO opportunities (title, description, company, type, deadline, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, company, type, deadline, req.user!.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { title, description, company, type, deadline, status } = req.body;
    const result = await pool.query(
      `UPDATE opportunities SET title=$1, description=$2, company=$3, type=$4, deadline=$5, status=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [title, description, company, type, deadline, status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    await pool.query('DELETE FROM opportunities WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
