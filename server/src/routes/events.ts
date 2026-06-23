import { Router } from 'express';
import { Event } from '../models/Event';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name').sort({ eventDate: 1 });
    const result = events.map(e => ({
      ...e.toObject(),
      registered_count: e.registrations.length,
      creator_name: (e.createdBy as any)?.name,
    }));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ ...event.toObject(), registered_count: event.registrations.length, creator_name: (event.createdBy as any)?.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireRole('admin', 'moderator'), async (req: AuthRequest, res) => {
  try {
    const { title, description, location, event_date, seats, zoom_link, image_url, is_online } = req.body;
    const event = await Event.create({
      title, description, location,
      eventDate: event_date,
      seats: seats || 0,
      zoomLink: zoom_link,
      imageUrl: image_url,
      isOnline: is_online || false,
      createdBy: req.user!.id,
    });
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { title, description, location, event_date, seats, zoom_link, image_url, is_online } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, {
      title, description, location,
      eventDate: event_date,
      seats, zoomLink: zoom_link,
      imageUrl: image_url,
      isOnline: is_online,
    }, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/register', authenticate, async (req: AuthRequest, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.seats > 0 && event.registrations.length >= event.seats) {
      return res.status(400).json({ error: 'Event is full' });
    }

    const userId = new mongoose.Types.ObjectId(req.user!.id);
    if (!event.registrations.some(r => r.equals(userId))) {
      event.registrations.push(userId);
      await event.save();
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/register', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    await Event.findByIdAndUpdate(req.params.id, { $pull: { registrations: userId } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/registration', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const event = await Event.findById(req.params.id);
    const registered = event ? event.registrations.some(r => r.equals(userId)) : false;
    res.json({ registered });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
