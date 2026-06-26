import { Router } from 'express';
import webpush from 'web-push';
import { PushSubscription } from '../models/PushSubscription';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@mmt-community.site';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
  console.warn('⚠️  VAPID keys not configured — push notifications disabled');
}

// GET /api/push/vapid-public-key
router.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// POST /api/push/subscribe
router.post('/subscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'بيانات الاشتراك غير مكتملة' });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userId: req.user!.id, endpoint, keys },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/push/unsubscribe
router.delete('/unsubscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.deleteOne({ endpoint, userId: req.user!.id });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/push/send - admin only, broadcast notification
router.post('/send', authenticate, requireRole('admin', 'moderator'), async (req: AuthRequest, res) => {
  try {
    const { title, body, url = '/', targetUserId } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'العنوان والمحتوى مطلوبان' });

    const filter: any = {};
    if (targetUserId) filter.userId = targetUserId;

    const subs = await PushSubscription.find(filter);
    const payload = JSON.stringify({ title, body, url, icon: '/logo.png', badge: '/logo.png' });

    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
          .catch(async (err) => {
            // Remove invalid subscriptions (410 Gone)
            if (err.statusCode === 410 || err.statusCode === 404) {
              await PushSubscription.deleteOne({ _id: sub._id });
            }
            throw err;
          })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({ success: true, sent, failed, total: subs.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
