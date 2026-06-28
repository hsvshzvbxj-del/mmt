import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET must be set');

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'لم يتم توفير رمز المصادقة' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'رمز المصادقة غير صالح أو منتهي الصلاحية' });
  }
}

export async function authenticateAndCheckBan(req: AuthRequest, res: Response, next: NextFunction) {
  authenticate(req, res, async () => {
    if (!req.user) return;
    try {
      const user = await User.findById(req.user.id).select('status banInfo muteInfo');
      if (!user) return res.status(401).json({ error: 'المستخدم غير موجود' });

      if (user.banInfo?.isBanned) {
        const ban = user.banInfo;
        if (ban.banType === 'temporary' && ban.expiresAt && ban.expiresAt < new Date()) {
          await User.findByIdAndUpdate(req.user.id, {
            'banInfo.isBanned': false,
            status: 'active',
          });
        } else if (ban.banType !== 'shadow') {
          return res.status(403).json({ error: 'تم حظر هذا الحساب', banInfo: { type: ban.banType, reason: ban.reason, expiresAt: ban.expiresAt } });
        }
      }

      if (user.muteInfo?.isMuted && user.muteInfo.expiresAt && user.muteInfo.expiresAt < new Date()) {
        await User.findByIdAndUpdate(req.user.id, { 'muteInfo.isMuted': false });
      }

      next();
    } catch {
      return res.status(500).json({ error: 'خطأ في التحقق من الحساب' });
    }
  });
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'يجب تسجيل الدخول' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'صلاحيات غير كافية' });
    next();
  };
}

export function requireAnyRole(...roles: string[]) {
  return requireRole(...roles);
}

export function isAdminOrMod(role: string): boolean {
  return ['super_admin', 'admin', 'moderator', 'senior_moderator'].includes(role);
}

export function generateToken(user: { id: string; email: string; role: string; name: string }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function generateRefreshToken(user: { id: string }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
}

export async function logAudit(
  action: string,
  performedById: string,
  opts: { targetUserId?: string; targetResource?: string; targetResourceId?: string; details?: any; req?: Request }
) {
  try {
    await AuditLog.create({
      action,
      performedBy: performedById,
      targetUser: opts.targetUserId,
      targetResource: opts.targetResource,
      targetResourceId: opts.targetResourceId,
      details: opts.details,
      ipAddress: opts.req?.ip,
      userAgent: opts.req?.headers['user-agent'],
    });
  } catch (e) {
    console.error('Audit log error:', e);
  }
}
