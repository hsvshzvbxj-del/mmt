import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'طلبات كثيرة جداً، حاول لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'محاولات تسجيل دخول كثيرة، حاول بعد 15 دقيقة' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'تجاوزت حد الرفع، حاول بعد ساعة' },
  standardHeaders: true,
  legacyHeaders: false,
});

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  function clean(obj: any): any {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
    }
    if (Array.isArray(obj)) return obj.map(clean);
    if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      for (const key of Object.keys(obj)) {
        if (!key.startsWith('$') && !key.includes('.')) {
          cleaned[key] = clean(obj[key]);
        }
      }
      return cleaned;
    }
    return obj;
  }
  if (req.body) req.body = clean(req.body);
  next();
}
