import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import api from '../lib/api';
import { Users, Calendar, Briefcase, BookOpen, ArrowLeft, Star, Lightbulb, Network, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
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
      <section className="relative overflow-hidden bg-[#0a1526] text-white min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1526] via-[#1e3a5f] to-[#0a1526] opacity-90" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-secondary border border-secondary/30 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
              <Star className="w-4 h-4 fill-secondary" />
              المجتمع المهني الأول للتسويق في العالم العربي
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-white">
              مجتمع
              <span className="text-secondary block mt-2">مبادرة تسويقية</span>
            </h1>

            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              بيئة مهنية تجمع قادة التسويق والمستشارين ورواد الأعمال لتبادل المعرفة وبناء الشراكات وخلق فرص نوعية في العالم العربي.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join" className="bg-secondary text-[#0a1526] px-8 py-4 rounded-lg text-lg font-bold hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5">
                انضم إلى المجتمع
              </Link>
              <Link href="/about" className="border border-white/30 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/10 transition-all backdrop-blur-sm">
                تعرف علينا
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-sm animate-bounce">
          <div className="w-px h-8 bg-white/20" />
          اكتشف المزيد
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: 'عضو نشط', value: stats?.members || 0 },
              { icon: Calendar, label: 'فعالية', value: stats?.events || 0 },
              { icon: Briefcase, label: 'فرصة متاحة', value: stats?.opportunities || 0 },
              { icon: BookOpen, label: 'مقال ومورد', value: stats?.articles || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center group">
                <Icon className="w-8 h-8 text-secondary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-4xl md:text-5xl font-bold mb-1 text-white">
                  <CountUp target={value} />+
                </div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Pillars */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">ركائز المجتمع</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              نبني مجتمعاً متكاملاً يقدم لأعضائه ثلاثة محاور رئيسية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: 'المعرفة',
                color: 'bg-blue-50 text-blue-600',
                borderColor: 'border-blue-200',
                items: ['ندوات وويبينارات', 'مقالات متخصصة', 'موارد ومراجع', 'تسجيلات الفعاليات'],
              },
              {
                icon: Network,
                title: 'التواصل',
                color: 'bg-pink-50 text-pink-600',
                borderColor: 'border-pink-200',
                items: ['شبكة مهنية موسعة', 'فرص تعاون', 'لقاءات دورية', 'دليل الأعضاء'],
              },
              {
                icon: TrendingUp,
                title: 'الفرص',
                color: 'bg-green-50 text-green-600',
                borderColor: 'border-green-200',
                items: ['وظائف تسويقية', 'مشاريع استشارية', 'شراكات تجارية', 'مشاريع مستقلة'],
              },
            ].map(({ icon: Icon, title, color, borderColor, items }) => (
              <div key={title} className={`bg-white rounded-2xl p-8 border-2 ${borderColor} hover:shadow-lg transition-all hover:-translate-y-1 group`}>
                <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">{title}</h3>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
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
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-2">الفعاليات القادمة</h2>
                <p className="text-muted-foreground">لا تفوت أحدث فعاليات المجتمع</p>
              </div>
              <Link href="/events" className="hidden md:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
                جميع الفعاليات <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="bg-white rounded-xl border hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden group">
                    <div className="bg-gradient-to-br from-primary to-primary/80 h-48 flex items-center justify-center p-6">
                      <div className="text-center text-white">
                        <Calendar className="w-10 h-10 mb-3 mx-auto opacity-80" />
                        <div className="text-2xl font-bold">{new Date(event.event_date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}</div>
                        <div className="text-white/70 text-sm mt-1">{new Date(event.event_date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {event.is_online && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">أونلاين</span>}
                        {event.seats > 0 && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{event.seats} مقعد</span>}
                      </div>
                      <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link href="/events" className="inline-flex items-center gap-2 text-primary font-medium border border-primary px-6 py-2.5 rounded-lg hover:bg-primary/5">
                جميع الفعاليات <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#0a1526] via-[#1e3a5f] to-[#0a1526] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">جاهز للانضمام؟</h2>
            <p className="text-white/70 text-lg mb-10 leading-relaxed">
              كن جزءاً من مجتمع يضم نخبة المسوقين والمستشارين ورواد الأعمال في العالم العربي. تقدم بطلبك اليوم.
            </p>
            <Link href="/join" className="inline-block bg-secondary text-[#0a1526] px-10 py-4 rounded-lg text-lg font-bold hover:bg-secondary/90 transition-all shadow-lg hover:-translate-y-0.5">
              تقدم بطلب العضوية
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
