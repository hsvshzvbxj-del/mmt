import mongoose from 'mongoose';

export async function initializeDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB successfully');
  await seedDatabase();
}

async function seedDatabase() {
  const { User } = await import('../models/User');
  const { Event } = await import('../models/Event');
  const { Opportunity } = await import('../models/Opportunity');
  const { Discussion } = await import('../models/Discussion');
  const { Article } = await import('../models/Article');

  const adminExists = await User.findOne({ email: 'admin@micommunity.com' });
  if (adminExists) return;

  const bcrypt = await import('bcryptjs');
  const adminHash = await bcrypt.default.hash('Admin@1234', 10);

  const admin = await User.create({
    name: 'Platform Administrator',
    email: 'admin@micommunity.com',
    passwordHash: adminHash,
    role: 'admin',
    city: 'Dubai',
    specialization: 'Community Management',
    company: 'Marketing Initiative Community',
    bio: 'Platform administrator and community builder.',
    status: 'active',
  });

  const memberHash = await bcrypt.default.hash('Member@1234', 10);
  const membersData = [
    { name: 'Sara Al-Hassan', email: 'sara@example.com', city: 'Dubai', specialization: 'Digital Marketing', experience: '8 years', industry: 'Technology', company: 'TechCorp ME', bio: 'Passionate digital marketing strategist with 8+ years of experience.' },
    { name: 'Ahmad Khalil', email: 'ahmad@example.com', city: 'Riyadh', specialization: 'Brand Strategy', experience: '12 years', industry: 'Retail', company: 'AlFanar Group', bio: 'Senior brand strategist focused on building iconic brands in MENA.' },
    { name: 'Lina Mansour', email: 'lina@example.com', city: 'Beirut', specialization: 'Content Marketing', experience: '5 years', industry: 'Media', company: 'MediaPulse', bio: 'Content creator and marketing consultant helping brands tell better stories.' },
  ];

  const members = [];
  for (const m of membersData) {
    const user = await User.create({ ...m, passwordHash: memberHash, role: 'member', status: 'active' });
    members.push(user);
  }

  await Event.create([
    {
      title: 'Digital Marketing Summit 2026',
      description: 'Join leading marketing professionals for an insightful day of keynotes, workshops, and networking opportunities.',
      location: 'Dubai World Trade Centre',
      eventDate: new Date('2026-07-15T09:00:00'),
      seats: 200,
      isOnline: false,
      createdBy: admin._id,
    },
    {
      title: 'Marketing Analytics Masterclass',
      description: 'A deep dive into data-driven marketing strategies, measurement frameworks, and analytics tools for modern marketers.',
      location: 'Online (Zoom)',
      eventDate: new Date('2026-07-28T15:00:00'),
      seats: 100,
      isOnline: true,
      createdBy: admin._id,
    },
  ]);

  await Opportunity.create([
    {
      title: 'Senior Digital Marketing Manager',
      description: 'We are looking for an experienced Digital Marketing Manager to lead our regional campaigns across MENA markets.',
      company: 'TechVentures ME',
      type: 'job',
      deadline: new Date('2026-08-01'),
      status: 'active',
      createdBy: admin._id,
    },
    {
      title: 'Brand Strategy Consultant',
      description: 'Seeking a brand strategy consultant for a 3-month engagement to revamp our corporate identity and positioning.',
      company: 'AlNoor Holdings',
      type: 'consulting',
      deadline: new Date('2026-07-31'),
      status: 'active',
      createdBy: admin._id,
    },
  ]);

  const sara = members[0];
  await Discussion.create([
    {
      title: 'How is AI changing content marketing in 2026?',
      content: 'With the rapid advancement of AI tools, content marketing is undergoing a massive transformation. From AI-generated drafts to personalized content at scale, what strategies are you using to stay ahead? Share your experiences!',
      tags: ['AI', 'Content Marketing', 'Technology'],
      authorId: sara._id,
      likesCount: 12,
    },
    {
      title: 'Best practices for marketing attribution in the MENA region',
      content: 'Marketing attribution has always been tricky, especially in markets with diverse consumer behaviors. What attribution models are working for your campaigns in MENA?',
      tags: ['Attribution', 'Analytics', 'MENA'],
      authorId: sara._id,
      likesCount: 8,
    },
  ]);

  await Article.create({
    title: 'The Future of Marketing in the Arab World',
    content: 'The Arab marketing landscape is evolving at an unprecedented pace. With digital penetration reaching new heights across the Gulf and Levant regions, marketers must adapt their strategies to meet increasingly sophisticated consumers where they are...',
    category: 'Industry Insights',
    authorId: admin._id,
    isPublished: true,
  });

  console.log('Database seeded successfully');
}

export default mongoose;
