import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import api from '../lib/api';
import { Calendar, MapPin, Users, Video, Clock, ChevronLeft } from 'lucide-react';
import { formatDateTime } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export default function EventsPage() {
  const { isAuthenticated } = useAuth();
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.get('/events').then(r => r.data),
  });

  const now = new Date();
  const upcoming = events?.filter((e: any) => new Date(e.eventDate) >= now) || [];
  const past = events?.filter((e: any) => new Date(e.eventDate) < now) || [];

  return (
    <div className="animate-fade-in">
      <section className="bg-[#0a1526] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-secondary/15 text-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">الفعاليات</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">فعاليات المجتمع</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-loose">ندوات وورش عمل ولقاءات مهنية تجمع نخبة المسوقين في العالم العربي</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded-lg mb-4 w-3/4" />
                <div className="h-4 bg-gray-100 rounded-lg mb-2 w-1/2" />
                <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 bg-secondary rounded-full" />
                  <h2 className="text-2xl font-bold text-foreground">
                    الفعاليات القادمة
                    <span className="mr-2 text-base font-medium text-muted-foreground">({upcoming.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcoming.map((event: any) => (
                    <EventCard key={event.id} event={event} isAuthenticated={isAuthenticated} />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 bg-muted-foreground/30 rounded-full" />
                  <h2 className="text-2xl font-bold text-foreground">
                    الفعاليات السابقة
                    <span className="mr-2 text-base font-medium text-muted-foreground">({past.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-65">
                  {past.map((event: any) => (
                    <EventCard key={event.id} event={event} isAuthenticated={isAuthenticated} past />
                  ))}
                </div>
              </div>
            )}

            {!upcoming.length && !past.length && (
              <div className="text-center py-32">
                <div className="w-20 h-20 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-primary/40" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">لا توجد فعاليات حالياً</h3>
                <p className="text-muted-foreground">تابعنا للاطلاع على الفعاليات القادمة</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, isAuthenticated, past }: { event: any; isAuthenticated: boolean; past?: boolean }) {
  return (
    <Link href={`/events/${event.id}`}>
      <div className={`bg-white rounded-2xl border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer ${past ? '' : 'border-transparent shadow-sm ring-1 ring-border'}`}>
        <div className={`h-1.5 ${past ? 'bg-muted' : 'bg-gradient-to-r from-secondary via-primary to-[#2a4a7f]'}`} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug text-lg">{event.title}</h3>
            {event.isOnline ? (
              <span className="shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                <Video className="w-3 h-3" /> أونلاين
              </span>
            ) : (
              <span className="shrink-0 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-medium">حضوري</span>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-5 leading-relaxed">{event.description}</p>
          )}

          <div className="space-y-2.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-primary" />
              </div>
              {formatDateTime(event.eventDate)}
            </div>
            {event.location && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
                {event.location}
              </div>
            )}
            {event.seats > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </div>
                {event.registered_count}/{event.seats} مقعد
              </div>
            )}
          </div>

          {!past && (
            <div className="mt-5 pt-4 border-t flex items-center justify-between">
              {isAuthenticated
                ? <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">التسجيل مفتوح</span>
                : <span className="text-xs text-muted-foreground">سجّل دخولك للتسجيل</span>
              }
              <span className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                التفاصيل <ChevronLeft className="w-4 h-4" />
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
