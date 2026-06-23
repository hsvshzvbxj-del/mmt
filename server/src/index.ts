import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/index';
import authRoutes from './routes/auth';
import membersRoutes from './routes/members';
import membershipRoutes from './routes/membership';
import eventsRoutes from './routes/events';
import opportunitiesRoutes from './routes/opportunities';
import discussionsRoutes from './routes/discussions';
import articlesRoutes from './routes/articles';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/discussions', discussionsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
