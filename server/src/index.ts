import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './db/index';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Security checks
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set — using insecure default. Set JWT_SECRET in production!');
}

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/discussions', discussionsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/push', pushRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
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
