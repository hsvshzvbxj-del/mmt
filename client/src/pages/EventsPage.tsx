import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import api from '../lib/api';
import { Calendar, MapPin, Users, Video, Clock } from 'lucide-react';
import { formatDate, formatDateTime } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export default function EventsPage() {
  const { isAuthenticated } = useAuth();
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.get('/events').then(r => r.data),
  });

  const now = new Date();
  const upcoming = events?.filter((e: any) => new Date(e.event_date) >= now) || [];
  const past = events?.filter((e: any) => new Date(e.event_date) < now) || [];

  return (
    <div className="animate-fade-in">
      <section className="bg-[#0a1526] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">الفعاليات</h1>
          <p className="text-white/70">ابق على اطلاع بأحدث فعاليات المجتمع</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded mb-3 w-3/4" />
                <div className="h-4 bg-gray-100 rounded mb-2 w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-2 h-6 bg-primary rounded-full" />
                  الفعاليات القادمة ({upcoming.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcoming.map((event: any) => (
                    <EventCard key={event.id} event={event} isAuthenticated={isAuthenticated} />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-2 h-6 bg-muted-foreground/30 rounded-full" />
                  الفعاليات السابقة ({past.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-70">
                  {past.map((event: any) => (
                    <EventCard key={event.id} event={event} isAuthenticated={isAuthenticated} past />
                  ))}
                </div>
              </div>
            )}

            {!upcoming.length && !past.length && (
              <div className="text-center py-20">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد فعاليات حالياً</p>
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
      <div className="bg-white rounded-xl border hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden group cursor-pointer">
        <div className={`h-3 ${past ? 'bg-muted' : 'bg-gradient-to-r from-primary to-[#2a4a7f]'}`} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{event.title}</h3>
            {event.is_online ? (
              <span className="shrink-0 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                <Video className="w-3 h-3" /> أونلاين
              </span>
            ) : (
              <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">حضوري</span>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-primary" />
              {formatDateTime(event.event_date)}
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-primary" />
                {event.location}
              </div>
            )}
            {event.seats > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0 text-primary" />
                {event.registered_count}/{event.seats} مقعد
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
