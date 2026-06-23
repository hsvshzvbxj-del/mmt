import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { MembershipRequest } from '../models/MembershipRequest';
import { User } from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/apply', async (req, res) => {
  try {
    const { fullName, email, phone, city, specialization, company, experience, industry, contribution, source, linkedin } = req.body;
    if (!fullName || !email) return res.status(400).json({ error: 'Full name and email are required' });

    const existingReq = await MembershipRequest.findOne({ email });
    if (existingReq) return res.status(400).json({ error: 'An application with this email already exists' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'An account with this email already exists' });

    const request = await MembershipRequest.create({
      fullName, email, phone, city, specialization, company,
      experience, industry, contribution, source, linkedin,
    });
    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await MembershipRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status must be approved or rejected' });

    const application = await MembershipRequest.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    application.status = status;
    application.notes = notes;
    await application.save();

    if (status === 'approved') {
      const existing = await User.findOne({ email: application.email });
      if (!existing) {
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const hash = await bcrypt.hash(tempPassword, 10);
        await User.create({
          name: application.fullName,
          email: application.email,
          passwordHash: hash,
          phone: application.phone,
          city: application.city,
          specialization: application.specialization,
          company: application.company,
          experience: application.experience,
          industry: application.industry,
          linkedin: application.linkedin,
          role: 'member',
          status: 'active',
        });
      }
    }

    res.json({ success: true, status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
