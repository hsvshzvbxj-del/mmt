import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './db/index';
import { generalLimiter, authLimiter, uploadLimiter, sanitizeInput } from './middleware/security';

import authRoutes from './routes/auth';
import membersRoutes from './routes/members';
import membershipRoutes from './routes/membership';
import eventsRoutes from './routes/events';
import opportunitiesRoutes from './routes/opportunities';
import discussionsRoutes from './routes/discussions';
import articlesRoutes from './routes/articles';
import adminRoutes from './routes/admin';
import chatRoutes from './routes/chat';
import pushRoutes from './routes/push';
import uploadRoutes from './routes/upload';
import banRoutes from './routes/ban';
import messagesRoutes from './routes/messages';
import reportsRoutes from './routes/reports';
import auditlogRoutes from './routes/auditlog';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(sanitizeInput);
app.use(generalLimiter);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/discussions', discussionsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api/ban', banRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditlogRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'خطأ غير متوقع في الخادم' });
});

if (isProduction) {
  const staticPath = path.join(__dirname, '..', 'public');
  app.use(express.static(staticPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
