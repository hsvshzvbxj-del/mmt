import { Router } from 'express';
import { ChatMessage } from '../models/ChatMessage';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/chat?room=general&before=<timestamp>&limit=50
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const room = (req.query.room as string) || 'general';
    const limit = Math.min(parseInt((req.query.limit as string) || '50'), 100);
    const before = req.query.before ? new Date(req.query.before as string) : undefined;

    const filter: any = { room };
    if (before) filter.createdAt = { $lt: before };

    const messages = await ChatMessage.find(filter)
      .populate('authorId', 'name avatarUrl specialization role')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Return in chronological order
    const result = messages.reverse().map(m => ({
      _id: m._id,
      id: m._id.toString(),
      content: m.content,
      room: m.room,
      createdAt: m.createdAt,
      author: {
        id: (m.authorId as any)?._id?.toString(),
        name: (m.authorId as any)?.name,
        avatarUrl: (m.authorId as any)?.avatarUrl,
        specialization: (m.authorId as any)?.specialization,
        role: (m.authorId as any)?.role,
      },
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/chat - send a message
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, room = 'general' } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'المحتوى مطلوب' });
    }
    if (content.trim().length > 2000) {
      return res.status(400).json({ error: 'الرسالة طويلة جداً (الحد الأقصى 2000 حرف)' });
    }

    const msg = await ChatMessage.create({
      content: content.trim(),
      authorId: req.user!.id,
      room,
    });

    await msg.populate('authorId', 'name avatarUrl specialization role');

    res.status(201).json({
      id: msg._id.toString(),
      content: msg.content,
      room: msg.room,
      createdAt: msg.createdAt,
      author: {
        id: (msg.authorId as any)?._id?.toString(),
        name: (msg.authorId as any)?.name,
        avatarUrl: (msg.authorId as any)?.avatarUrl,
        specialization: (msg.authorId as any)?.specialization,
        role: (msg.authorId as any)?.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/chat/:id - delete a message (own or admin/mod)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const msg = await ChatMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'الرسالة غير موجودة' });

    const isOwner = msg.authorId.toString() === req.user!.id;
    const isPrivileged = ['admin', 'moderator'].includes(req.user!.role);
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ error: 'غير مصرح' });
    }

    await msg.deleteOne();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chat/poll?room=general&since=<timestamp> - long-poll for new messages
router.get('/poll', authenticate, async (req: AuthRequest, res) => {
  try {
    const room = (req.query.room as string) || 'general';
    const since = req.query.since ? new Date(req.query.since as string) : new Date(Date.now() - 60000);

    const messages = await ChatMessage.find({
      room,
      createdAt: { $gt: since },
    })
      .populate('authorId', 'name avatarUrl specialization role')
      .sort({ createdAt: 1 })
      .limit(50);

    const result = messages.map(m => ({
      id: m._id.toString(),
      content: m.content,
      room: m.room,
      createdAt: m.createdAt,
      author: {
        id: (m.authorId as any)?._id?.toString(),
        name: (m.authorId as any)?.name,
        avatarUrl: (m.authorId as any)?.avatarUrl,
        specialization: (m.authorId as any)?.specialization,
        role: (m.authorId as any)?.role,
      },
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
