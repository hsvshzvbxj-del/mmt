import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/index';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, city, specialization, experience, industry, company, 
       linkedin, bio, website, skills, avatar_url, role, status, created_at 
       FROM users WHERE id = $1`,
      [req.user!.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, phone, city, specialization, experience, industry, company, linkedin, bio, website, skills } = req.body;
    const result = await pool.query(
      `UPDATE users SET name=$1, phone=$2, city=$3, specialization=$4, experience=$5, 
       industry=$6, company=$7, linkedin=$8, bio=$9, website=$10, skills=$11, updated_at=NOW()
       WHERE id=$12 RETURNING id, name, email, phone, city, specialization, experience, industry, company, linkedin, bio, website, skills, avatar_url, role, status`,
      [name, phone, city, specialization, experience, industry, company, linkedin, bio, website, skills, req.user!.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
