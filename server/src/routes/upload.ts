import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

const MAX_SIZE = 3 * 1024 * 1024; // 3MB base64 ~ 2.25MB image

function validateBase64Image(data: string): boolean {
  return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(data) && data.length <= MAX_SIZE;
}

// POST /api/upload/avatar
router.post('/avatar', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'لم يتم إرسال صورة' });
    if (!validateBase64Image(image)) return res.status(400).json({ error: 'صورة غير صالحة أو حجمها كبير جداً (الحد 2MB)' });

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { avatarUrl: image },
      { new: true }
    ).select('-passwordHash');

    res.json({ avatarUrl: user!.avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/upload/cover
router.post('/cover', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'لم يتم إرسال صورة' });
    if (!validateBase64Image(image)) return res.status(400).json({ error: 'صورة غير صالحة أو حجمها كبير جداً (الحد 2MB)' });

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { coverUrl: image },
      { new: true }
    ).select('-passwordHash');

    res.json({ coverUrl: (user as any).coverUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
