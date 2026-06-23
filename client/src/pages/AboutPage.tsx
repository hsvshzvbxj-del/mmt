import { Eye, Target, CheckCircle, Shield } from 'lucide-react';

const objectives = [
  'توفير بيئة مهنية متخصصة لتبادل المعرفة والخبرات التسويقية',
  'دعم المسوقين ورواد الأعمال في تطوير مهاراتهم وتوسيع شبكة علاقاتهم',
  'ربط الكفاءات التسويقية بالفرص الوظيفية والاستشارية في السوق العربي',
  'تنظيم فعاليات وندوات تسويقية تساهم في رفع المستوى المهني للأعضاء',
  'نشر ثقافة التسويق الاحترافي والابتكار في المنطقة العربية',
  'خلق نظام بيئي متكامل يدعم نمو وتطور المنظومة التسويقية',
];

const policies = [
  'الاحترام المتبادل والتعامل المهني بين جميع الأعضاء',
  'الحفاظ على سرية المعلومات وعدم مشاركة المحتوى الخاص',
  'عدم الترويج للمنتجات والخدمات إلا في الأقسام المخصصة لذلك',
  'المساهمة الفعّالة وتقديم قيمة حقيقية للمجتمع',
  'الالتزام بمعايير الأمانة والشفافية في جميع التعاملات',
  'احترام سياسة الملكية الفكرية وحقوق النشر',
];

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-[#0a1526] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">عن مجتمعنا</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            قصة مجتمع تأسس على شغف التسويق وقيم التعاون والتطوير المهني في العالم العربي.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-primary to-[#2a4a7f] text-white rounded-2xl p-8">
            <Eye className="w-10 h-10 text-secondary mb-4" />
            <h2 className="text-2xl font-bold mb-4">رؤيتنا</h2>
            <p className="text-white/80 leading-relaxed">
              أن نكون المجتمع المهني الأول والأكثر تأثيراً للمسوقين ورواد الأعمال في العالم العربي، ونموذجاً يُحتذى به في بناء مجتمعات مهنية متخصصة تدفع عجلة التنمية الاقتصادية.
            </p>
          </div>
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-2 border-secondary/30 rounded-2xl p-8">
            <Target className="w-10 h-10 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-foreground">مهمتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              توفير منصة احترافية متكاملة تجمع قادة التسويق والمستشارين ورواد الأعمال، وتمكينهم من تبادل المعرفة، وبناء الشراكات، واستثمار الفرص في بيئة تعاونية محفزة.
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl border p-8 mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">قصة المجتمع</h2>
          <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-4">
            <p>
              وُلد مجتمع مبادرة تسويقية من إدراك عميق لحاجة السوق العربي إلى فضاء مهني متخصص يجمع العقول التسويقية المتميزة في منطقة تزخر بالمواهب والفرص.
            </p>
            <p>
              انطلقت الفكرة من مجموعة من المسوقين المحترفين الذين آمنوا بأن التعاون والتشبيك المهني هو المحرك الحقيقي للنمو في عصر التحول الرقمي، وأن المجتمعات المهنية المتخصصة هي بيئة الابتكار الأمثل.
            </p>
            <p>
              اليوم، يضم مجتمعنا مئات الأعضاء من مختلف دول العالم العربي، يتبادلون المعرفة ويبنون الشراكات ويصنعون الفرق في مشهد التسويق العربي.
            </p>
          </div>
        </div>

        {/* Objectives */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-primary" />
            أهداف المجتمع
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border hover:border-primary/30 transition-colors">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-muted-foreground text-sm leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Policies */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            سياسات المجتمع
          </h2>
          <div className="bg-white rounded-2xl border p-8">
            <ul className="space-y-4">
              {policies.map((policy, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-relaxed">{policy}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
