import { Eye, Target, CheckCircle, Shield, Users, Award, Globe } from 'lucide-react';

const objectives = [
  'توفير بيئة مهنية متخصصة لتبادل المعرفة والخبرات التسويقية',
  'دعم المسوقين ورواد الأعمال في تطوير مهاراتهم وتوسيع شبكة علاقاتهم',
  'ربط الكفاءات التسويقية بالفرص الوظيفية والاستشارية في السوق العربي',
  'تنظيم فعاليات وندوات تسويقية تساهم في رفع المستوى المهني للأعضاء',
  'نشر ثقافة التسويق الاحترافي والابتكار في المنطقة العربية',
  'خلق نظام بيئي متكامل يدعم نمو وتطور المنظومة التسويقية',
];

const policies = [
  'الاحترام المتبادل والتعامل المهني بين جميع الأعضاء في جميع الأوقات',
  'الحفاظ على سرية المعلومات وعدم مشاركة المحتوى الخاص خارج المجتمع',
  'عدم الترويج للمنتجات والخدمات إلا في الأقسام والأوقات المخصصة لذلك',
  'المساهمة الفعّالة وتقديم قيمة حقيقية تعود بالنفع على أعضاء المجتمع',
  'الالتزام بمعايير الأمانة والشفافية في جميع التعاملات والنقاشات المهنية',
  'احترام سياسة الملكية الفكرية وحقوق النشر لجميع المحتويات المشاركة',
];

const values = [
  { icon: Users, title: 'المجتمع أولاً', desc: 'نؤمن بأن قوتنا في تعاوننا وتكاملنا كمجتمع مهني متماسك' },
  { icon: Award, title: 'التميز المهني', desc: 'نسعى دائماً لرفع المستوى المهني وتقديم أفضل الممارسات التسويقية' },
  { icon: Globe, title: 'التأثير العربي', desc: 'نهدف إلى أن يكون لمجتمعنا أثر ملموس في المشهد التسويقي العربي' },
];

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-[#0a1526] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-secondary/15 text-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">من نحن</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">عن مجتمع<br />مبادرة تسويقية</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-loose">
            قصة مجتمع تأسّس على شغف التسويق وقيم التعاون والتطوير المهني المستدام في العالم العربي.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20 max-w-5xl">
        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <div className="bg-gradient-to-br from-[#0a1526] to-[#1e3a5f] text-white rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">رؤيتنا</h2>
              <p className="text-white/70 leading-loose">
                أن نكون المجتمع المهني الأول والأكثر تأثيراً للمسوقين ورواد الأعمال في العالم العربي، ونموذجاً يُحتذى به في بناء مجتمعات مهنية متخصصة تدفع عجلة التنمية الاقتصادية.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">مهمتنا</h2>
              <p className="text-muted-foreground leading-loose">
                توفير منصة احترافية متكاملة تجمع قادة التسويق والمستشارين ورواد الأعمال، وتمكينهم من تبادل المعرفة وبناء الشراكات واستثمار الفرص في بيئة تعاونية محفزة.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">قيمنا</h2>
            <p className="text-muted-foreground">المبادئ التي تحكم كل ما نفعله</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl border p-10 mb-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-secondary to-primary rounded-l-2xl" />
          <div className="mr-4">
            <h2 className="text-3xl font-bold text-foreground mb-6">قصة المجتمع</h2>
            <div className="text-muted-foreground leading-loose space-y-5 text-base">
              <p>
                وُلد مجتمع مبادرة تسويقية من إدراك عميق لحاجة السوق العربي إلى فضاء مهني متخصص يجمع العقول التسويقية المتميزة في منطقة تزخر بالمواهب والفرص.
              </p>
              <p>
                انطلقت الفكرة من مجموعة من المسوقين المحترفين الذين آمنوا بأن التعاون والتشبيك المهني هو المحرك الحقيقي للنمو في عصر التحول الرقمي، وأن المجتمعات المهنية المتخصصة هي بيئة الابتكار الأمثل.
              </p>
              <p>
                اليوم، يضم مجتمعنا أعضاء من مختلف دول العالم العربي، يتبادلون المعرفة ويبنون الشراكات ويصنعون الفارق في مشهد التسويق العربي.
              </p>
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">أهداف المجتمع</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-xl border hover:border-primary/30 hover:shadow-md transition-all group">
                <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 group-hover:scale-110 transition-transform">{i + 1}</span>
                <p className="text-muted-foreground text-sm leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Policies */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">سياسات المجتمع</h2>
          </div>
          <div className="bg-white rounded-2xl border p-8">
            <ul className="space-y-5">
              {policies.map((policy, i) => (
                <li key={i} className="flex items-start gap-4 pb-5 border-b last:border-0 last:pb-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-muted-foreground leading-relaxed text-sm">{policy}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
