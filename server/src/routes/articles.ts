import { Router } from 'express';
import { Article } from '../models/Article';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const filter: any = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    const articles = await Article.find(filter).populate('authorId', 'name avatarUrl').sort({ createdAt: -1 });
    const result = articles.map(a => ({ ...a.toObject(), author_name: (a.authorId as any)?.name, author_avatar: (a.authorId as any)?.avatarUrl }));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('authorId', 'name avatarUrl');
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ ...article.toObject(), author_name: (article.authorId as any)?.name, author_avatar: (article.authorId as any)?.avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireRole('admin', 'moderator'), async (req: AuthRequest, res) => {
  try {
    const { title, content, cover_image, category } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
    const article = await Article.create({ title, content, coverImage: cover_image, category, authorId: req.user!.id });
    res.status(201).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { title, content, cover_image, category, is_published } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { title, content, coverImage: cover_image, category, isPublished: is_published },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
