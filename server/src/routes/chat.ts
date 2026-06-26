import { Router } from 'express';
import mongoose from 'mongoose';
import { ChatMessage } from '../models/ChatMessage';
import { User } from '../models/User';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

function fmtMsg(msg: any, userId: string, userRole: string) {
  const o = msg.toObject ? msg.toObject() : msg;
  const isAdmin = ['admin', 'moderator'].includes(userRole);
  return {
    id: o._id.toString(),
    content: o.content,
    room: o.room,
    type: o.type || 'text',
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    replyToId: o.replyToId?.toString() || null,
    readBy: (o.readBy || []).map((r: any) => ({
      userId: r.userId?._id?.toString() || r.userId?.toString(),
      name: r.userId?.name || '',
      readAt: r.readAt,
    })),
    reactions: (o.reactions || []).map((r: any) => ({
      userId: r.userId?._id?.toString() || r.userId?.toString(),
      emoji: r.emoji,
    })),
    visibleTo: o.visibleTo?.length ? o.visibleTo.map((id: any) => id.toString()) : null,
    isAdmin,
    author: {
      id: o.authorId?._id?.toString() || o.authorId?.toString(),
      name: o.authorId?.name || '',
      avatarUrl: o.authorId?.avatarUrl || null,
      specialization: o.authorId?.specialization || '',
      role: o.authorId?.role || 'member',
    },
  };
}

function buildVisibilityFilter(userId: string, userRole: string) {
  if (['admin', 'moderator'].includes(userRole)) return {};
  return {
    $or: [
      { visibleTo: { $exists: false } },
      { visibleTo: { $size: 0 } },
      { visibleTo: new mongoose.Types.ObjectId(userId) },
      { authorId: new mongoose.Types.ObjectId(userId) },
    ],
  };
}

// GET /api/chat — load messages
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { room = 'general', limit = 60, before } = req.query;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const isAdmin = ['admin', 'moderator'].includes(userRole);

    const query: any = { room };
    if (before) query.createdAt = { $lt: new Date(before as string) };
    if (!isAdmin) query.isDeleted = false;
    Object.assign(query, buildVisibilityFilter(userId, userRole));

    const msgs = await ChatMessage.find(query)
      .populate('authorId', 'name avatarUrl specialization role')
      .populate('readBy.userId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    msgs.reverse();

    // Mark all as read by current user
    const idsToMark = msgs
      .filter((m: any) => !m.readBy?.some((r: any) => r.userId?.toString() === userId))
      .map((m: any) => m._id);

    if (idsToMark.length > 0) {
      await ChatMessage.updateMany(
        { _id: { $in: idsToMark } },
        { $push: { readBy: { userId: new mongoose.Types.ObjectId(userId), readAt: new Date() } } }
      );
      idsToMark.forEach((id: any) => {
        const msg = msgs.find((m: any) => m._id.toString() === id.toString());
        if (msg) (msg as any).readBy.push({ userId: { _id: userId, name: req.user!.name }, readAt: new Date() });
      });
    }

    res.json(msgs.map(m => fmtMsg(m, userId, userRole)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// GET /api/chat/poll — long-poll for new messages + read updates
router.get('/poll', authenticate, async (req: AuthRequest, res) => {
  try {
    const { room = 'general', since } = req.query;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const isAdmin = ['admin', 'moderator'].includes(userRole);

    if (!since) return res.json([]);

    const query: any = {
      room,
      $or: [
        { createdAt: { $gt: new Date(since as string) } },
        { updatedAt: { $gt: new Date(since as string) } },
      ],
    };
    if (!isAdmin) query.isDeleted = false;
    Object.assign(query, buildVisibilityFilter(userId, userRole));

    const msgs = await ChatMessage.find(query)
      .populate('authorId', 'name avatarUrl specialization role')
      .populate('readBy.userId', 'name avatarUrl')
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    // Mark as read
    const idsToMark = msgs
      .filter((m: any) => !m.readBy?.some((r: any) => r.userId?.toString() === userId))
      .map((m: any) => m._id);

    if (idsToMark.length > 0) {
      await ChatMessage.updateMany(
        { _id: { $in: idsToMark } },
        { $push: { readBy: { userId: new mongoose.Types.ObjectId(userId), readAt: new Date() } } }
      );
      idsToMark.forEach((id: any) => {
        const msg = msgs.find((m: any) => m._id.toString() === id.toString());
        if (msg) (msg as any).readBy.push({ userId: { _id: userId, name: req.user!.name }, readAt: new Date() });
      });
    }

    res.json(msgs.map(m => fmtMsg(m, userId, userRole)));
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// GET /api/chat/members — list members for "visible to" targeting
router.get('/members', authenticate, async (req: AuthRequest, res) => {
  try {
    const members = await User.find({ status: 'active' })
      .select('name avatarUrl specialization role')
      .sort({ name: 1 })
      .lean();
    res.json(members.map((m: any) => ({ id: m._id.toString(), name: m.name, avatarUrl: m.avatarUrl, specialization: m.specialization, role: m.role })));
  } catch {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/chat — send message
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, room = 'general', replyToId, visibleTo } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'الرسالة فارغة' });

    const msg = await ChatMessage.create({
      content: content.trim(),
      authorId: new mongoose.Types.ObjectId(req.user!.id),
      room,
      replyToId: replyToId ? new mongoose.Types.ObjectId(replyToId) : undefined,
      visibleTo: visibleTo?.length ? visibleTo.map((id: string) => new mongoose.Types.ObjectId(id)) : undefined,
      readBy: [{ userId: new mongoose.Types.ObjectId(req.user!.id), readAt: new Date() }],
    });

    const populated = await ChatMessage.findById(msg._id)
      .populate('authorId', 'name avatarUrl specialization role')
      .populate('readBy.userId', 'name avatarUrl')
      .lean();

    res.status(201).json(fmtMsg(populated, req.user!.id, req.user!.role));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/chat/:id/react — toggle reaction
router.post('/:id/react', authenticate, async (req: AuthRequest, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: 'مطلوب emoji' });

    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const msg = await ChatMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'الرسالة غير موجودة' });

    const existingIdx = msg.reactions.findIndex(r => r.userId.toString() === req.user!.id && r.emoji === emoji);
    if (existingIdx >= 0) {
      msg.reactions.splice(existingIdx, 1);
    } else {
      // Remove any previous reaction from this user
      msg.reactions = msg.reactions.filter(r => r.userId.toString() !== req.user!.id) as any;
      msg.reactions.push({ userId, emoji } as any);
    }
    await msg.save();

    const populated = await ChatMessage.findById(msg._id)
      .populate('authorId', 'name avatarUrl specialization role')
      .populate('readBy.userId', 'name avatarUrl')
      .lean();

    res.json(fmtMsg(populated, req.user!.id, req.user!.role));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// DELETE /api/chat/:id — ghost delete (admin/mod = silent, owner = own message)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const isAdmin = ['admin', 'moderator'].includes(userRole);
    const msg = await ChatMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'الرسالة غير موجودة' });

    const isOwner = msg.authorId.toString() === userId;
    if (!isAdmin && !isOwner) return res.status(403).json({ error: 'غير مصرح' });

    // Admins: ghost delete (isDeleted=true, no trace shown to others)
    // Owners: actual content clear
    if (isAdmin && !isOwner) {
      msg.isDeleted = true;
      msg.deletedAt = new Date();
      await msg.save();
      res.json({ id: req.params.id, ghostDeleted: true });
    } else {
      await msg.deleteOne();
      res.json({ id: req.params.id, deleted: true });
    }
  } catch {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/chat/screenshot — report screenshot attempt
router.post('/screenshot', authenticate, async (req: AuthRequest, res) => {
  try {
    const { room } = req.body;
    // Create a system message visible only to admins/mods
    await ChatMessage.create({
      content: `⚠️ تنبيه: المستخدم "${req.user!.name}" أخذ لقطة شاشة في غرفة "${room || 'غير معروفة'}"`,
      authorId: new mongoose.Types.ObjectId(req.user!.id),
      room: '__admin__',
      type: 'system',
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
