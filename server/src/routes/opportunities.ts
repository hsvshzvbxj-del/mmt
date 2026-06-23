import { Router } from 'express';
import { Opportunity } from '../models/Opportunity';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const filter: any = { status: 'active' };
    if (req.query.type) filter.type = req.query.type;
    const opps = await Opportunity.find(filter).populate('createdBy', 'name').sort({ createdAt: -1 });
    const result = opps.map(o => ({ ...o.toObject(), creator_name: (o.createdBy as any)?.name }));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id).populate('createdBy', 'name');
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ ...opp.toObject(), creator_name: (opp.createdBy as any)?.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireRole('admin', 'moderator'), async (req: AuthRequest, res) => {
  try {
    const { title, description, company, type, deadline } = req.body;
    const opp = await Opportunity.create({ title, description, company, type, deadline, createdBy: req.user!.id });
    res.status(201).json(opp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { title, description, company, type, deadline, status } = req.body;
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, { title, description, company, type, deadline, status }, { new: true });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    await Opportunity.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
