import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import api from '../lib/api';
import { Users, Calendar, Briefcase, BookOpen, ArrowLeft, Star, Lightbulb, Network, TrendingUp, CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <div ref={ref}>{count}</div>;
}

export default function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/members/stats').then(r => r.data),
  });

  const { data: events } = useQuery({
    queryKey: ['events-home'],
    queryFn: () => api.get('/events').then(r => r.data),
  });

  const upcomingEvents = events?.filter((e: any) => new Date(e.event_date) > new Date()).slice(0, 3) || [];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a1526] text-white min-h-[92vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#060e1a] via-[#1e3a5f] to-[#060e1a] opacity-95" />
          <div className="absolute top-10 right-10 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/4 rounded-full blur-3xl" />
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        </div>

        <div className="container mx-auto px-4 py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/8 text-secondary border border-secondary/25 px-5 py-2.5 rounded-full text-sm font-medium mb-10 backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 fill-secondary" />
              المجتمع المهني الأول للتسويق في العالم العربي
            </div>

            <h1 className="text-6xl md:text-8xl font-bold leading-tight mb-6 text-white tracking-tight">
              مجتمع
              <span className="text-secondary block mt-1">مبادرة تسويقية</span>
            </h1>

            <p className="text-xl text-white/65 max-w-2xl mx-auto mb-12 leading-loose">
              بيئة مهنية حصرية تجمع قادة التسويق والمستشارين ورواد الأعمال لتبادل المعرفة وبناء الشراكات وخلق فرص نوعية في العالم العربي.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join" className="bg-secondary text-[#0a1526] px-10 py-4 rounded-xl text-lg font-bold hover:bg-secondary/90 transition-all shadow-xl hover:shadow-secondary/20 hover:-translate-y-1">
                انضم إلى المجتمع
              </Link>
              <Link href="/about" className="border border-white/25 text-white px-10 py-4 rounded-xl text-lg font-medium hover:bg-white/8 transition-all backdrop-blur-sm hover:-translate-y-1">
                تعرف علينا
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/35 text-sm">
              {[
                { icon: CheckCircle, text: 'عضوية مدروسة وحصرية' },
                { icon: CheckCircle, text: 'خبراء من كل دول العالم العربي' },
                { icon: CheckCircle, text: 'فرص مهنية حقيقية' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-secondary/60" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/20" />
          <span>اكتشف المزيد</span>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(232,165,184,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(30,58,95,0.5) 0%, transparent 60%)'}} />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: 'عضو نشط', value: stats?.members ?? 0 },
              { icon: Calendar, label: 'فعالية مهنية', value: stats?.events ?? 0 },
              { icon: Briefcase, label: 'فرصة متاحة', value: stats?.opportunities ?? 0 },
              { icon: BookOpen, label: 'مقال ومورد', value: stats?.articles ?? 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Icon className="w-7 h-7 text-secondary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-1 text-white flex items-center justify-center gap-0.5">
                  <CountUp target={value} />
                  {value > 0 && <span className="text-secondary">+</span>}
                </div>
                <div className="text-white/60 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Pillars */}
      <section className="py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/8 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">ماذا نقدم</div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">ركائز المجتمع</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              نبني مجتمعاً متكاملاً يقدم لأعضائه ثلاثة محاور رئيسية تصنع الفارق
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: 'المعرفة',
                description: 'محتوى تسويقي متخصص وجلسات حصرية مع خبراء الصناعة',
                color: 'bg-blue-50 text-blue-600',
                iconBg: 'bg-blue-100',
                borderColor: 'border-blue-100 hover:border-blue-300',
                items: ['ندوات وويبينارات متخصصة', 'مقالات من قادة الصناعة', 'موارد ومراجع احترافية', 'تسجيلات الفعاليات الحية'],
              },
              {
                icon: Network,
                title: 'التواصل',
                description: 'شبكة علاقات مهنية مع نخبة المسوقين والمستشارين في العالم العربي',
                color: 'bg-rose-50 text-rose-600',
                iconBg: 'bg-rose-100',
                borderColor: 'border-rose-100 hover:border-rose-300',
                items: ['دليل أعضاء تفاعلي', 'فرص تعاون ومشاريع مشتركة', 'لقاءات دورية حضورية وإلكترونية', 'مجموعات اهتمام متخصصة'],
              },
              {
                icon: TrendingUp,
                title: 'الفرص',
                description: 'فرص وظيفية واستشارية وشراكات تجارية حصرية للأعضاء',
                color: 'bg-emerald-50 text-emerald-600',
                iconBg: 'bg-emerald-100',
                borderColor: 'border-emerald-100 hover:border-emerald-300',
                items: ['وظائف تسويقية مختارة', 'مشاريع استشارية', 'شراكات تجارية استراتيجية', 'مشاريع مستقلة وفريلانس'],
              },
            ].map(({ icon: Icon, title, description, color, iconBg, borderColor, items }) => (
              <div key={title} className={`bg-white rounded-2xl p-8 border-2 ${borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group`}>
                <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${color.split(' ')[1]}`} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{description}</p>
                <ul className="space-y-2.5">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-muted-foreground text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${color.split(' ')[1].replace('text-', 'bg-')} shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-28 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="inline-block bg-primary/8 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">على الرادار</div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-2">الفعاليات القادمة</h2>
                <p className="text-muted-foreground">لا تفوت أحدث فعاليات مجتمع مبادرة تسويقية</p>
              </div>
              <Link href="/events" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all border border-primary/20 px-5 py-2.5 rounded-xl hover:bg-primary/5">
                جميع الفعاليات <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="bg-white rounded-2xl border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group cursor-pointer">
                    <div className="bg-gradient-to-br from-[#0a1526] to-[#1e3a5f] h-48 flex items-center justify-center p-6 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(232,165,184,0.4), transparent 60%)'}} />
                      <div className="text-center text-white relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="text-2xl font-bold">{new Date(event.event_date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' })}</div>
                        <div className="text-white/60 text-sm mt-1">{new Date(event.event_date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {event.is_online
                          ? <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">أونلاين</span>
                          : <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">حضوري</span>
                        }
                        {event.seats > 0 && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{event.seats} مقعد</span>}
                      </div>
                      <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">{event.title}</h3>
                      {event.description && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link href="/events" className="inline-flex items-center gap-2 text-primary font-medium border border-primary/30 px-6 py-2.5 rounded-xl hover:bg-primary/5">
                جميع الفعاليات <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-28 bg-gradient-to-br from-[#060e1a] via-[#1e3a5f] to-[#060e1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-secondary/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="inline-block bg-secondary/15 text-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">انضم اليوم</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">جاهز لتكون جزءاً من<br />مجتمع يصنع الفارق؟</h2>
            <p className="text-white/60 text-lg mb-10 leading-loose max-w-xl mx-auto">
              انضم إلى نخبة المسوقين والمستشارين ورواد الأعمال في العالم العربي. قدّم طلبك اليوم وانتظر قرار القبول.
            </p>
            <Link href="/join" className="inline-block bg-secondary text-[#0a1526] px-12 py-4 rounded-xl text-lg font-bold hover:bg-secondary/90 transition-all shadow-xl hover:shadow-secondary/20 hover:-translate-y-1">
              تقدم بطلب العضوية
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
