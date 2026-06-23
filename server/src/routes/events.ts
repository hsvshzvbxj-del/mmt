import { Router } from 'express';
import pool from '../db/index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name as creator_name, 
        COUNT(er.id) as registered_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN event_registrations er ON e.id = er.event_id
      GROUP BY e.id, u.name
      ORDER BY e.event_date ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name as creator_name,
        COUNT(er.id) as registered_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN event_registrations er ON e.id = er.event_id
      WHERE e.id = $1
      GROUP BY e.id, u.name
    `, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Event not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireRole('admin', 'moderator'), async (req: AuthRequest, res) => {
  try {
    const { title, description, location, event_date, seats, zoom_link, image_url, is_online } = req.body;
    const result = await pool.query(
      `INSERT INTO events (title, description, location, event_date, seats, zoom_link, image_url, is_online, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, location, event_date, seats, zoom_link, image_url, is_online, req.user!.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { title, description, location, event_date, seats, zoom_link, image_url, is_online } = req.body;
    const result = await pool.query(
      `UPDATE events SET title=$1, description=$2, location=$3, event_date=$4, seats=$5, 
       zoom_link=$6, image_url=$7, is_online=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [title, description, location, event_date, seats, zoom_link, image_url, is_online, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Event not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register for event
router.post('/:id/register', authenticate, async (req: AuthRequest, res) => {
  try {
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    const event = eventResult.rows[0];
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const countResult = await pool.query('SELECT COUNT(*) FROM event_registrations WHERE event_id = $1', [req.params.id]);
    if (event.seats > 0 && parseInt(countResult.rows[0].count) >= event.seats) {
      return res.status(400).json({ error: 'Event is full' });
    }

    await pool.query(
      'INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, req.user!.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel registration
router.delete('/:id/register', authenticate, async (req: AuthRequest, res) => {
  try {
    await pool.query(
      'DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check registration status
router.get('/:id/registration', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );
    res.json({ registered: result.rows.length > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
