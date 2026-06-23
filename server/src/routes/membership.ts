import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Submit membership application
router.post('/apply', async (req, res) => {
  try {
    const { fullName, email, phone, city, specialization, company, experience, industry, contribution, source, linkedin } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    // Check if email already exists
    const existing = await pool.query('SELECT id FROM membership_requests WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An application with this email already exists' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const result = await pool.query(
      `INSERT INTO membership_requests (full_name, email, phone, city, specialization, company, experience, industry, contribution, source, linkedin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [fullName, email, phone, city, specialization, company, experience, industry, contribution, source, linkedin]
    );

    res.status(201).json({ success: true, request: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: list all applications
router.get('/', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM membership_requests';
    const params: any[] = [];
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: approve or reject
router.put('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const reqResult = await pool.query('SELECT * FROM membership_requests WHERE id = $1', [req.params.id]);
    const application = reqResult.rows[0];
    if (!application) return res.status(404).json({ error: 'Application not found' });

    await pool.query(
      `UPDATE membership_requests SET status=$1, notes=$2, updated_at=NOW() WHERE id=$3`,
      [status, notes, req.params.id]
    );

    // If approved, create user account
    if (status === 'approved') {
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      const hash = await bcrypt.hash(tempPassword, 10);

      await pool.query(
        `INSERT INTO users (name, email, password_hash, phone, city, specialization, company, experience, industry, linkedin, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'member', 'active')
         ON CONFLICT (email) DO NOTHING`,
        [application.full_name, application.email, hash, application.phone, application.city,
         application.specialization, application.company, application.experience, application.industry, application.linkedin]
      );
    }

    res.json({ success: true, status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
