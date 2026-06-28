import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken, authenticate, logAudit, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

    if (user.banInfo?.isBanned && user.banInfo.banType !== 'shadow') {
      const ban = user.banInfo;
      if (ban.banType === 'temporary' && ban.expiresAt && ban.expiresAt < new Date()) {
        await User.findByIdAndUpdate(user._id, { 'banInfo.isBanned': false, status: 'active' });
      } else {
        return res.status(403).json({
          error: 'تم حظر هذا الحساب',
          banInfo: { type: ban.banType, reason: ban.reason, expiresAt: ban.expiresAt },
        });
      }
    }

    if (user.status === 'suspended') return res.status(403).json({ error: 'الحساب موقوف مؤقتاً' });
    if (user.status === 'archived') return res.status(403).json({ error: 'الحساب غير نشط' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

    await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date(), $inc: { loginCount: 1 } });

    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role, name: user.name });

    await logAudit('user.login', user._id.toString(), { req });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        onboarding: user.onboarding,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    await User.findByIdAndUpdate(req.user!.id, { lastActiveAt: new Date() });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.put('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const allowed = ['name', 'phone', 'city', 'country', 'language', 'specialization', 'experience',
      'industry', 'company', 'linkedin', 'bio', 'website', 'skills', 'interests', 'profileTheme'];
    const update: any = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user!.id, update, { new: true }).select('-passwordHash');
    await logAudit('user.update', req.user!.id, { req });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.put('/me/password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'بيانات ناقصة' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });

    const hash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.user!.id, { passwordHash: hash });
    await logAudit('user.password_change', req.user!.id, { req });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

router.put('/me/onboarding', authenticate, async (req: AuthRequest, res) => {
  try {
    const { step, completed, interests, country, language } = req.body;
    const update: any = {};
    if (step !== undefined) update['onboarding.step'] = step;
    if (completed !== undefined) update['onboarding.completed'] = completed;
    if (interests) update['onboarding.interests'] = interests;
    if (country) { update['onboarding.country'] = country; update['country'] = country; }
    if (language) { update['onboarding.language'] = language; update['language'] = language; }
    if (completed) update['onboarding.completedAt'] = new Date();

    const user = await User.findByIdAndUpdate(req.user!.id, update, { new: true }).select('-passwordHash');
    if (completed) await logAudit('onboarding.complete', req.user!.id, { req });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
