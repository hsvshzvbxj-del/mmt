import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../hooks/useToast';
import { Calendar, MapPin, Users, Video, ArrowRight, ExternalLink, Clock, User } from 'lucide-react';
import { formatDateTime } from '../lib/utils';
import Toaster from '../components/ui/Toaster';

export default function EventDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get(`/events/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const { data: regStatus } = useQuery({
    queryKey: ['event-reg', id],
    queryFn: () => api.get(`/events/${id}/registration`).then(r => r.data),
    enabled: !!id && isAuthenticated,
  });

  const register = useMutation({
    mutationFn: () => api.post(`/events/${id}/register`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-reg', id] });
      qc.invalidateQueries({ queryKey: ['event', id] });
      toast('تم تسجيلك في الفعالية بنجاح!', 'success');
    },
    onError: (err: any) => toast(err.response?.data?.error || 'حدث خطأ', 'error'),
  });

  const cancel = useMutation({
    mutationFn: () => api.delete(`/events/${id}/register`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-reg', id] });
      qc.invalidateQueries({ queryKey: ['event', id] });
      toast('تم إلغاء تسجيلك', 'info');
    },
    onError: (err: any) => toast(err.response?.data?.error || 'حدث خطأ', 'error'),
  });

  if (isLoading) return (
    <div className="container mx-auto px-4 py-16 max-w-3xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-3/4" />
      <div className="h-4 bg-gray-100 rounded mb-2 w-1/2" />
    </div>
  );

  if (!event) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">لم يتم العثور على الفعالية</p>
    </div>
  );

  const isPast = new Date(event.event_date) < new Date();
  const isFull = event.seats > 0 && parseInt(event.registered_count) >= event.seats;
  const isRegistered = regStatus?.registered;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl animate-fade-in">
      <Toaster />
      <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowRight className="w-4 h-4" /> الفعاليات
      </Link>

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="h-4 bg-gradient-to-r from-primary to-[#2a4a7f]" />
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground leading-snug">{event.title}</h1>
            {event.is_online ? (
              <span className="shrink-0 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Video className="w-4 h-4" /> أونلاين
              </span>
            ) : (
              <span className="shrink-0 text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-full">حضوري</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-muted/30 rounded-xl p-4">
              <Clock className="w-4 h-4 text-primary mb-2" />
              <div className="text-xs text-muted-foreground mb-1">التاريخ والوقت</div>
              <div className="font-medium text-foreground text-sm">{formatDateTime(event.event_date)}</div>
            </div>
            {event.location && (
              <div className="bg-muted/30 rounded-xl p-4">
                <MapPin className="w-4 h-4 text-primary mb-2" />
                <div className="text-xs text-muted-foreground mb-1">الموقع</div>
                <div className="font-medium text-foreground text-sm">{event.location}</div>
              </div>
            )}
            {event.seats > 0 && (
              <div className="bg-muted/30 rounded-xl p-4">
                <Users className="w-4 h-4 text-primary mb-2" />
                <div className="text-xs text-muted-foreground mb-1">المقاعد</div>
                <div className="font-medium text-foreground text-sm">{event.registered_count}/{event.seats}</div>
              </div>
            )}
            {event.creator_name && (
              <div className="bg-muted/30 rounded-xl p-4">
                <User className="w-4 h-4 text-primary mb-2" />
                <div className="text-xs text-muted-foreground mb-1">المنظم</div>
                <div className="font-medium text-foreground text-sm">{event.creator_name}</div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-foreground mb-3">تفاصيل الفعالية</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          )}

          {event.zoom_link && isRegistered && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700 mb-2 font-medium">رابط الانضمام (Zoom)</p>
              <a href={event.zoom_link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <ExternalLink className="w-4 h-4" /> انضم للاجتماع
              </a>
            </div>
          )}

          {!isPast && isAuthenticated && (
            <div className="pt-6 border-t">
              {isRegistered ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    أنت مسجل في هذه الفعالية
                  </div>
                  <button
                    onClick={() => cancel.mutate()}
                    disabled={cancel.isPending}
                    className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {cancel.isPending ? 'جارٍ الإلغاء...' : 'إلغاء التسجيل'}
                  </button>
                </div>
              ) : isFull ? (
                <p className="text-muted-foreground text-sm">الفعالية ممتلئة</p>
              ) : (
                <button
                  onClick={() => register.mutate()}
                  disabled={register.isPending}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {register.isPending ? 'جارٍ التسجيل...' : 'سجّل في الفعالية'}
                </button>
              )}
            </div>
          )}
          {!isPast && !isAuthenticated && (
            <div className="pt-6 border-t">
              <Link href="/login" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                سجّل دخولك للتسجيل
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
