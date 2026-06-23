import { Router } from 'express';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Opportunity } from '../models/Opportunity';
import { Article } from '../models/Article';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/stats', async (_req, res) => {
  try {
    const [members, events, opportunities, articles] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      Event.countDocuments(),
      Opportunity.countDocuments({ status: 'active' }),
      Article.countDocuments({ isPublished: true }),
    ]);
    res.json({ members, events, opportunities, articles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/admin/all', authenticate, requireRole('admin', 'moderator'), async (_req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/admin/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status, role }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/admin/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, city, industry, specialization, experience } = req.query;
    const filter: any = { status: 'active' };
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (industry) filter.industry = { $regex: industry, $options: 'i' };
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
    if (experience) filter.experience = experience;

    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, status: 'active' }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'Member not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
