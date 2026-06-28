import { Router } from 'express';
import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation';
import { PrivateMessage } from '../models/PrivateMessage';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const conversations = await Conversation.find({
      participants: new mongoose.Types.ObjectId(userId),
      [`isDeleted.${userId}`]: { $ne: true },
    })
      .populate('participants', 'name avatarUrl specialization status lastActiveAt')
      .sort({ lastMessageAt: -1 })
      .limit(50);

    const result = conversations.map(conv => {
      const other = (conv.participants as any[]).find(p => p._id.toString() !== userId);
      return {
        id: conv._id,
        participant: other ? {
          id: other._id,
          name: other.name,
          avatarUrl: other.avatarUrl,
          specialization: other.specialization,
          isOnline: other.lastActiveAt && (Date.now() - new Date(other.lastActiveAt).getTime()) < 5 * 60 * 1000,
        } : null,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount?.get(userId) || 0,
        isArchived: conv.isArchived?.get(userId) || false,
        isBlocked: conv.isBlocked,
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.post('/conversations', authenticate, async (req: AuthRequest, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user!.id;

    if (recipientId === userId) return res.status(400).json({ error: 'لا يمكن إرسال رسالة لنفسك' });

    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ error: 'المستخدم غير موجود' });

    let conversation = await Conversation.findOne({
      participants: {
        $all: [
          new mongoose.Types.ObjectId(userId),
          new mongoose.Types.ObjectId(recipientId),
        ],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, recipientId],
        unreadCount: new Map(),
        isArchived: new Map(),
        isDeleted: new Map(),
      });
    } else {
      const deletedMap = conversation.isDeleted || new Map();
      if (deletedMap.get(userId)) {
        deletedMap.set(userId, false);
        conversation.isDeleted = deletedMap;
        await conversation.save();
      }
    }

    await conversation.populate('participants', 'name avatarUrl specialization');
    res.json({ conversationId: conversation._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/conversations/:convId/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { convId } = req.params;
    const { before, limit = 50 } = req.query;

    const conv = await Conversation.findOne({
      _id: convId,
      participants: new mongoose.Types.ObjectId(userId),
    });
    if (!conv) return res.status(404).json({ error: 'المحادثة غير موجودة' });

    const query: any = {
      conversationId: convId,
      deletedFor: { $ne: new mongoose.Types.ObjectId(userId) },
      isDeleted: false,
    };
    if (before) query.createdAt = { $lt: new Date(before as string) };

    const messages = await PrivateMessage.find(query)
      .populate('senderId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    messages.reverse();

    const unreadIds = messages
      .filter(m => m.senderId.toString() !== userId && m.status !== 'read')
      .map(m => m._id);

    if (unreadIds.length > 0) {
      await PrivateMessage.updateMany({ _id: { $in: unreadIds } }, { status: 'read', readAt: new Date() });
      const unreadMap = conv.unreadCount || new Map();
      unreadMap.set(userId, 0);
      conv.unreadCount = unreadMap;
      await conv.save();
    }

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.post('/conversations/:convId/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { convId } = req.params;
    const { content, replyToId } = req.body;

    if (!content?.trim()) return res.status(400).json({ error: 'محتوى الرسالة مطلوب' });

    const conv = await Conversation.findOne({
      _id: convId,
      participants: new mongoose.Types.ObjectId(userId),
    });
    if (!conv) return res.status(404).json({ error: 'المحادثة غير موجودة' });
    if (conv.isBlocked) return res.status(403).json({ error: 'لا يمكن الإرسال، المحادثة محظورة' });

    const message = await PrivateMessage.create({
      conversationId: convId,
      senderId: userId,
      content: content.trim(),
      replyToId: replyToId || undefined,
    });

    const recipientId = (conv.participants as any[]).find(p => p.toString() !== userId)?.toString();
    const unreadMap = conv.unreadCount || new Map();
    if (recipientId) unreadMap.set(recipientId, (unreadMap.get(recipientId) || 0) + 1);

    conv.lastMessage = content.trim().slice(0, 100);
    conv.lastMessageAt = new Date();
    conv.lastMessageBy = new mongoose.Types.ObjectId(userId);
    conv.unreadCount = unreadMap;
    await conv.save();

    await message.populate('senderId', 'name avatarUrl');
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.delete('/messages/:msgId', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const message = await PrivateMessage.findById(req.params.msgId);
    if (!message) return res.status(404).json({ error: 'الرسالة غير موجودة' });

    if (message.senderId.toString() === userId) {
      message.isDeleted = true;
      await message.save();
    } else {
      if (!message.deletedFor.some((id: any) => id.toString() === userId)) {
        message.deletedFor.push(new mongoose.Types.ObjectId(userId));
        await message.save();
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.put('/conversations/:convId/archive', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const conv = await Conversation.findOne({ _id: req.params.convId, participants: new mongoose.Types.ObjectId(userId) });
    if (!conv) return res.status(404).json({ error: 'المحادثة غير موجودة' });

    const archiveMap = conv.isArchived || new Map();
    archiveMap.set(userId, !archiveMap.get(userId));
    conv.isArchived = archiveMap;
    await conv.save();
    res.json({ archived: archiveMap.get(userId) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.delete('/conversations/:convId', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const conv = await Conversation.findOne({ _id: req.params.convId, participants: new mongoose.Types.ObjectId(userId) });
    if (!conv) return res.status(404).json({ error: 'المحادثة غير موجودة' });

    const deleteMap = conv.isDeleted || new Map();
    deleteMap.set(userId, true);
    conv.isDeleted = deleteMap;
    await conv.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/conversations/poll', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { since } = req.query;
    if (!since) return res.json([]);

    const messages = await PrivateMessage.find({
      createdAt: { $gt: new Date(since as string) },
      deletedFor: { $ne: new mongoose.Types.ObjectId(userId) },
      isDeleted: false,
    })
      .populate({
        path: 'conversationId',
        match: { participants: new mongoose.Types.ObjectId(userId) },
      })
      .populate('senderId', 'name avatarUrl')
      .sort({ createdAt: 1 })
      .limit(30);

    res.json(messages.filter(m => m.conversationId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/users/search', authenticate, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;
    const userId = req.user!.id;
    const filter: any = { status: 'active', _id: { $ne: new mongoose.Types.ObjectId(userId) } };
    if (q) filter.name = { $regex: q, $options: 'i' };

    const users = await User.find(filter)
      .select('name avatarUrl specialization')
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
