import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mic-secret-2026-CHANGE-IN-PRODUCTION';

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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'لم يتم توفير رمز المصادقة' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'رمز المصادقة غير صالح أو منتهي الصلاحية' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'يجب تسجيل الدخول' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'صلاحيات غير كافية' });
    next();
  };
}

export function generateToken(user: { id: string; email: string; role: string; name: string }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function generateShortToken(user: { id: string; email: string; role: string; name: string }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
}
