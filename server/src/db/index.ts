import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  try {
    await pool.query(schema);
    console.log('Database schema initialized successfully');
    await seedDatabase();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function seedDatabase() {
  // Check if admin already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@micommunity.com']);
  if (existing.rows.length > 0) return;

  const bcrypt = await import('bcryptjs');
  const adminHash = await bcrypt.default.hash('Admin@1234', 10);

  // Seed admin user
  await pool.query(`
    INSERT INTO users (name, email, password_hash, role, city, specialization, company, bio, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    'Platform Administrator',
    'admin@micommunity.com',
    adminHash,
    'admin',
    'Dubai',
    'Community Management',
    'Marketing Initiative Community',
    'Platform administrator and community builder.',
    'active'
  ]);

  // Seed some sample members
  const memberHash = await bcrypt.default.hash('Member@1234', 10);
  const members = [
    ['Sara Al-Hassan', 'sara@example.com', 'Dubai', 'Digital Marketing', '8 years', 'Technology', 'TechCorp ME', 'Passionate digital marketing strategist with 8+ years of experience.'],
    ['Ahmad Khalil', 'ahmad@example.com', 'Riyadh', 'Brand Strategy', '12 years', 'Retail', 'AlFanar Group', 'Senior brand strategist focused on building iconic brands in MENA.'],
    ['Lina Mansour', 'lina@example.com', 'Beirut', 'Content Marketing', '5 years', 'Media', 'MediaPulse', 'Content creator and marketing consultant helping brands tell better stories.'],
  ];

  for (const [name, email, city, specialization, experience, industry, company, bio] of members) {
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, city, specialization, experience, industry, company, bio, status)
      VALUES ($1, $2, $3, 'member', $4, $5, $6, $7, $8, $9, 'active')
    `, [name, email, memberHash, city, specialization, experience, industry, company, bio]);
  }

  // Seed events
  const adminUser = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@micommunity.com']);
  const adminId = adminUser.rows[0].id;

  await pool.query(`
    INSERT INTO events (title, description, location, event_date, seats, is_online, created_by)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7),
      ($8, $9, $10, $11, $12, $13, $14)
  `, [
    'Digital Marketing Summit 2026',
    'Join leading marketing professionals for an insightful day of keynotes, workshops, and networking opportunities.',
    'Dubai World Trade Centre',
    new Date('2026-07-15T09:00:00'),
    200,
    false,
    adminId,
    'Marketing Analytics Masterclass',
    'A deep dive into data-driven marketing strategies, measurement frameworks, and analytics tools for modern marketers.',
    'Online (Zoom)',
    new Date('2026-07-28T15:00:00'),
    100,
    true,
    adminId
  ]);

  // Seed opportunities
  await pool.query(`
    INSERT INTO opportunities (title, description, company, type, deadline, status, created_by)
    VALUES 
      ($1, $2, $3, $4, $5, 'active', $6),
      ($7, $8, $9, $10, $11, 'active', $12)
  `, [
    'Senior Digital Marketing Manager',
    'We are looking for an experienced Digital Marketing Manager to lead our regional campaigns across MENA markets.',
    'TechVentures ME',
    'job',
    new Date('2026-08-01'),
    adminId,
    'Brand Strategy Consultant',
    'Seeking a brand strategy consultant for a 3-month engagement to revamp our corporate identity and positioning.',
    'AlNoor Holdings',
    'consulting',
    new Date('2026-07-31'),
    adminId
  ]);

  // Seed discussions
  const saraUser = await pool.query('SELECT id FROM users WHERE email = $1', ['sara@example.com']);
  if (saraUser.rows.length > 0) {
    const saraId = saraUser.rows[0].id;
    await pool.query(`
      INSERT INTO discussions (title, content, tags, author_id, likes_count)
      VALUES 
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10)
    `, [
      'How is AI changing content marketing in 2026?',
      'With the rapid advancement of AI tools, content marketing is undergoing a massive transformation. From AI-generated drafts to personalized content at scale, what strategies are you using to stay ahead? Share your experiences!',
      ['AI', 'Content Marketing', 'Technology'],
      saraId,
      12,
      'Best practices for marketing attribution in the MENA region',
      'Marketing attribution has always been tricky, especially in markets with diverse consumer behaviors. What attribution models are working for your campaigns in MENA? Looking forward to hearing your approaches.',
      ['Attribution', 'Analytics', 'MENA'],
      saraId,
      8
    ]);
  }

  // Seed articles
  await pool.query(`
    INSERT INTO articles (title, content, category, author_id, is_published)
    VALUES ($1, $2, $3, $4, $5)
  `, [
    'The Future of Marketing in the Arab World',
    'The Arab marketing landscape is evolving at an unprecedented pace. With digital penetration reaching new heights across the Gulf and Levant regions, marketers must adapt their strategies to meet increasingly sophisticated consumers where they are...',
    'Industry Insights',
    adminId,
    true
  ]);

  console.log('Database seeded successfully');
}

export default pool;
