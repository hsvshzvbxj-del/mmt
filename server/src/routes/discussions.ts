import { Router } from 'express';
import { Discussion } from '../models/Discussion';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { notify } from '../lib/notify';
import mongoose from 'mongoose';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const filter: any = {};
    if (req.query.tag) filter.tags = req.query.tag;
    const discussions = await Discussion.find(filter)
      .populate('authorId', 'name avatarUrl specialization')
      .sort({ isPinned: -1, createdAt: -1 });

    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const result = discussions.map(d => ({
      ...d.toObject(),
      author_name: (d.authorId as any)?.name,
      author_avatar: (d.authorId as any)?.avatarUrl,
      author_specialization: (d.authorId as any)?.specialization,
      is_liked: d.likes.some(l => l.equals(userId)),
      is_saved: d.saves.some(s => s.equals(userId)),
      comments_count: d.comments.length,
    }));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('authorId', 'name avatarUrl specialization')
      .populate('comments.authorId', 'name avatarUrl');
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    const userId = new mongoose.Types.ObjectId(req.user!.id);
    res.json({
      ...discussion.toObject(),
      author_name: (discussion.authorId as any)?.name,
      author_avatar: (discussion.authorId as any)?.avatarUrl,
      author_specialization: (discussion.authorId as any)?.specialization,
      is_liked: discussion.likes.some(l => l.equals(userId)),
      is_saved: discussion.saves.some(s => s.equals(userId)),
      comments: discussion.comments.map(c => ({
        ...c.toObject(),
        author_name: (c.authorId as any)?.name,
        author_avatar: (c.authorId as any)?.avatarUrl,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
    const discussion = await Discussion.create({ title, content, tags: tags || [], authorId: req.user!.id });
    res.status(201).json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Not found' });
    if (discussion.authorId.toString() !== req.user!.id && !['admin', 'moderator'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await discussion.deleteOne();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Not found' });

    const idx = discussion.likes.findIndex(l => l.equals(userId));
    if (idx >= 0) {
      discussion.likes.splice(idx, 1);
      discussion.likesCount = Math.max(0, discussion.likesCount - 1);
      await discussion.save();
      res.json({ liked: false });
    } else {
      discussion.likes.push(userId);
      discussion.likesCount += 1;
      await discussion.save();
      // إشعار صاحب النقاش
      notify({
        userId: discussion.authorId,
        type: 'like',
        title: 'أُعجب شخص بنقاشك',
        body: `أعجبه نقاشك: "${discussion.title}"`,
        link: `/discussions/${discussion._id}`,
        triggeredBy: req.user!.id,
        resourceId: String(discussion._id),
        resourceType: 'discussion',
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/save', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Not found' });

    const idx = discussion.saves.findIndex(s => s.equals(userId));
    if (idx >= 0) {
      discussion.saves.splice(idx, 1);
      await discussion.save();
      res.json({ saved: false });
    } else {
      discussion.saves.push(userId);
      await discussion.save();
      res.json({ saved: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Not found' });

    const comment = { authorId: new mongoose.Types.ObjectId(req.user!.id), content } as any;
    discussion.comments.push(comment);
    await discussion.save();
    // إشعار صاحب النقاش بوجود تعليق جديد
    notify({
      userId: discussion.authorId,
      type: 'reply',
      title: 'تعليق جديد على نقاشك',
      body: `"${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`,
      link: `/discussions/${discussion._id}`,
      triggeredBy: req.user!.id,
      resourceId: String(discussion._id),
      resourceType: 'discussion',
    });
    res.status(201).json(discussion.comments[discussion.comments.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
