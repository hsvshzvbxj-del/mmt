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
    name: 'مدير المنصة',
    email: 'admin@micommunity.com',
    passwordHash: adminHash,
    role: 'admin',
    city: 'الرياض',
    specialization: 'إدارة المجتمعات المهنية',
    company: 'مجتمع مبادرة تسويقية',
    bio: 'مدير المنصة والمسؤول عن تطوير مجتمع مبادرة تسويقية.',
    status: 'active',
  });

  const memberHash = await bcrypt.default.hash('Member@1234', 10);

  const membersData = [
    {
      name: 'سارة الحسن',
      email: 'sara@example.com',
      city: 'دبي',
      specialization: 'التسويق الرقمي',
      experience: '5-10 سنوات',
      industry: 'التكنولوجيا',
      company: 'تك كورب الشرق الأوسط',
      bio: 'متخصصة في التسويق الرقمي وإدارة الحملات الإعلانية في أسواق الشرق الأوسط.',
    },
    {
      name: 'أحمد خليل',
      email: 'ahmad@example.com',
      city: 'الرياض',
      specialization: 'استراتيجية العلامة التجارية',
      experience: 'أكثر من 10 سنوات',
      industry: 'التجزئة',
      company: 'مجموعة الفنار',
      bio: 'خبير في بناء العلامات التجارية وتطوير الاستراتيجيات التسويقية في السوق العربي.',
    },
    {
      name: 'لينا منصور',
      email: 'lina@example.com',
      city: 'بيروت',
      specialization: 'تسويق المحتوى',
      experience: '3-5 سنوات',
      industry: 'الإعلام والاتصالات',
      company: 'ميديا بلس',
      bio: 'منشئة محتوى ومستشارة تسويقية متخصصة في بناء القصص الإبداعية للعلامات التجارية.',
    },
  ];

  const members = [];
  for (const m of membersData) {
    const user = await User.create({ ...m, passwordHash: memberHash, role: 'member', status: 'active' });
    members.push(user);
  }

  await Event.create([
    {
      title: 'قمة التسويق الرقمي 2026',
      description: 'انضم إلى نخبة المسوقين والمتخصصين في يوم مليء بالمحاضرات الرئيسية وورش العمل وجلسات التواصل المهني. نستعرض فيه أحدث اتجاهات التسويق الرقمي وتطبيقاتها العملية في السوق العربي.',
      location: 'مركز دبي التجاري العالمي، دبي',
      eventDate: new Date('2026-09-15T09:00:00'),
      seats: 200,
      isOnline: false,
      createdBy: admin._id,
    },
    {
      title: 'ماستركلاس: تحليلات التسويق المتقدمة',
      description: 'جلسة متخصصة تغوص في عمق استراتيجيات التسويق المبنية على البيانات، وأطر القياس والتحليل، وأدوات الذكاء الاصطناعي الحديثة التي يحتاجها كل مسوق محترف.',
      location: 'أونلاين (Zoom)',
      eventDate: new Date('2026-08-20T17:00:00'),
      seats: 150,
      isOnline: true,
      createdBy: admin._id,
    },
    {
      title: 'لقاء الشبكات المهنية — الرياض',
      description: 'لقاء حضوري حصري لأعضاء المجتمع في الرياض، فرصة ذهبية للتواصل المباشر وبناء علاقات مهنية مع نخبة المسوقين والمستشارين في المملكة العربية السعودية.',
      location: 'فندق فور سيزونز، الرياض',
      eventDate: new Date('2026-08-05T18:30:00'),
      seats: 50,
      isOnline: false,
      createdBy: admin._id,
    },
  ]);

  await Opportunity.create([
    {
      title: 'مدير تسويق رقمي أول',
      description: 'نبحث عن مدير تسويق رقمي بخبرة لا تقل عن 7 سنوات لقيادة استراتيجيات الحملات الرقمية عبر أسواق منطقة الشرق الأوسط وشمال أفريقيا. المهام تشمل إدارة الفريق، والميزانيات، وتحقيق أهداف النمو.',
      company: 'تك فنتشرز الشرق الأوسط',
      type: 'job',
      deadline: new Date('2026-09-01'),
      status: 'active',
      createdBy: admin._id,
    },
    {
      title: 'مستشار استراتيجية العلامة التجارية',
      description: 'نسعى إلى التعاقد مع مستشار متخصص لمدة 3 أشهر لإعادة هيكلة هوية شركتنا وتطوير استراتيجية تموضعها في السوق الخليجي. المشروع يشمل بحث السوق وتطوير الهوية البصرية.',
      company: 'النور القابضة',
      type: 'consulting',
      deadline: new Date('2026-08-15'),
      status: 'active',
      createdBy: admin._id,
    },
    {
      title: 'شراكة استراتيجية في تسويق المحتوى',
      description: 'نبحث عن شريك استراتيجي لتطوير منظومة تسويق المحتوى لعلامتنا التجارية في أسواق الخليج. الشراكة طويلة الأمد وتشمل إنتاج المحتوى متعدد القنوات.',
      company: 'ريادة للاستثمار',
      type: 'partnership',
      deadline: new Date('2026-09-30'),
      status: 'active',
      createdBy: admin._id,
    },
  ]);

  const sara = members[0];
  const ahmad = members[1];

  await Discussion.create([
    {
      title: 'كيف يُغيّر الذكاء الاصطناعي تسويق المحتوى في 2026؟',
      content: 'مع التطور المتسارع لأدوات الذكاء الاصطناعي، يشهد تسويق المحتوى تحولاً جذرياً. من المسودات الآلية إلى التخصيص الشخصي على نطاق واسع — ما الاستراتيجيات التي تتبعونها للبقاء في الصدارة؟ شاركونا تجاربكم وأفضل الممارسات.',
      tags: ['ذكاء اصطناعي', 'تسويق المحتوى', 'التكنولوجيا'],
      authorId: sara._id,
      likesCount: 24,
    },
    {
      title: 'أفضل نماذج نسب النجاح التسويقي في السوق العربي',
      content: 'نسب النجاح التسويقي (Marketing Attribution) كانت دائماً مسألة معقدة، خاصةً في أسواق تتميز بتنوع سلوكيات المستهلكين. ما النماذج التي تجدونها أكثر دقة وفاعلية في حملاتكم بمنطقة MENA؟ وكيف تتعاملون مع تعقيدات رحلة العميل متعددة القنوات؟',
      tags: ['نسب النجاح', 'التحليلات', 'MENA', 'البيانات'],
      authorId: sara._id,
      likesCount: 18,
    },
    {
      title: 'بناء العلامة التجارية الشخصية للمسوقين — من أين تبدأ؟',
      content: 'في عالم التسويق التنافسي، أصبح بناء العلامة الشخصية ضرورة وليس رفاهية. شاركونا رحلتكم: كيف بدأتم؟ ما المنصات التي أثبتت فاعليتها أكثر في السوق العربي؟ وما الأخطاء التي تمنيتم تجنّبها في البداية؟',
      tags: ['العلامة الشخصية', 'LinkedIn', 'نمو المهنة'],
      authorId: ahmad._id,
      likesCount: 31,
    },
  ]);

  await Article.create([
    {
      title: 'مستقبل التسويق في العالم العربي: اتجاهات 2026 وما بعدها',
      content: 'يشهد المشهد التسويقي العربي تحولات غير مسبوقة. مع ارتفاع معدلات انتشار الإنترنت والهاتف الذكي في دول الخليج والمشرق العربي، بات على المسوقين تكييف استراتيجياتهم لمواكبة المستهلكين المتطورين في أماكن تواجدهم الرقمية...\n\nيستكشف هذا المقال أبرز الاتجاهات التي ستشكّل ملامح التسويق العربي خلال السنوات القادمة، من تسويق المحتوى القصير والتجارب الشخصية المعتمدة على الذكاء الاصطناعي، إلى التسويق عبر المؤثرين وتحديات الخصوصية الرقمية.',
      category: 'Industry Insights',
      authorId: admin._id,
      isPublished: true,
    },
    {
      title: 'دليل المسوق إلى استراتيجيات التسويق عبر وسائل التواصل في 2026',
      content: 'تتطور منصات التواصل الاجتماعي بسرعة مذهلة، وما كان يُجدي قبل عامين قد لا يكون فعّالاً اليوم. في هذا الدليل الشامل، نستعرض أحدث الاستراتيجيات والأساليب المُثبتة لبناء حضور رقمي قوي ومؤثر على منصات مثل Instagram وTikTok وLinkedIn في السوق العربي.',
      category: 'Digital Marketing',
      authorId: admin._id,
      isPublished: true,
    },
  ]);

  console.log('تم زرع البيانات الأولية بنجاح');
}

export default mongoose;
