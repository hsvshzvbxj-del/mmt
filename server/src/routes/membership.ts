import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { MembershipRequest } from '../models/MembershipRequest';
import { User } from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';
import { notify } from '../lib/notify';

const router = Router();

/** Generate a cryptographically secure temporary password */
function generateSecurePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%';
  const all = upper + lower + digits + special;

  const rand = (chars: string) => chars[crypto.randomInt(chars.length)];

  // Ensure at least one of each required type
  const required = [rand(upper), rand(lower), rand(digits), rand(special)];
  const rest = Array.from({ length: 8 }, () => rand(all));
  const password = [...required, ...rest];

  // Shuffle using Fisher-Yates
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

router.post('/apply', async (req, res) => {
  try {
    const {
      fullName, email, phone, city, specialization, company,
      experience, industry, contribution, source, linkedin,
    } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'الاسم الكامل مطلوب' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'صيغة البريد الإلكتروني غير صحيحة' });
    }

    const existingReq = await MembershipRequest.findOne({ email: email.trim().toLowerCase() });
    if (existingReq) {
      return res.status(400).json({ error: 'يوجد طلب مسبق بهذا البريد الإلكتروني' });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'يوجد حساب مسجل بهذا البريد الإلكتروني' });
    }

    const request = await MembershipRequest.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      city: city?.trim(),
      specialization: specialization?.trim(),
      company: company?.trim(),
      experience,
      industry: industry?.trim(),
      contribution: contribution?.trim(),
      source: source?.trim(),
      linkedin: linkedin?.trim(),
    });

    res.status(201).json({ success: true, id: request._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

router.get('/', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await MembershipRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

router.put('/:id', authenticate, requireRole('admin', 'moderator'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'الحالة يجب أن تكون approved أو rejected' });
    }

    const application = await MembershipRequest.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'الطلب غير موجود' });

    application.status = status;
    if (notes !== undefined) application.notes = notes;
    await application.save();

    if (status === 'approved') {
      const existing = await User.findOne({ email: application.email });
      if (!existing) {
        const tempPassword = generateSecurePassword();
        const hash = await bcrypt.hash(tempPassword, 12);
        await User.create({
          name: application.fullName,
          email: application.email,
          passwordHash: hash,
          phone: application.phone,
          city: application.city,
          specialization: application.specialization,
          company: application.company,
          experience: application.experience,
          industry: application.industry,
          linkedin: application.linkedin,
          role: 'member',
          status: 'active',
        });
        // إشعار ترحيب للعضو الجديد
        const newUser = await User.findOne({ email: application.email });
        if (newUser) {
          notify({
            userId: String(newUser._id),
            type: 'welcome',
            title: '🎉 أهلاً بك في مجتمع مبادرة تسويقية!',
            body: 'تمت الموافقة على طلب انضمامك. ابدأ الآن بتعبئة ملفك الشخصي واكتشاف المجتمع.',
            link: '/profile',
          });
        }
        console.log(`✅ New member created: ${application.email} | Temp Password: ${tempPassword}`);
      }
    }

    res.json({ success: true, status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

export default router;
