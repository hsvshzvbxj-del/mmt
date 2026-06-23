import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Users, UserPlus, ClipboardList, Calendar, Briefcase, MessageSquare, BookOpen, ArrowLeft, TrendingUp } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { Link } from 'wouter';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
  });

  const stats = [
    { icon: Users, label: 'إجمالي الأعضاء', value: data?.stats.totalMembers, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { icon: UserPlus, label: 'أعضاء جدد (30 يوم)', value: data?.stats.newMembers, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { icon: ClipboardList, label: 'طلبات معلقة', value: data?.stats.pendingApplications, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { icon: Calendar, label: 'الفعاليات', value: data?.stats.totalEvents, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { icon: Briefcase, label: 'الفرص', value: data?.stats.totalOpportunities, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
    { icon: MessageSquare, label: 'النقاشات', value: data?.stats.totalDiscussions, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
    { icon: BookOpen, label: 'المقالات', value: data?.stats.totalArticles, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  ];

  const statusBadge = (status: string) => {
    if (status === 'pending') return 'bg-orange-100 text-orange-700 border border-orange-200';
    if (status === 'approved') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    return 'bg-red-100 text-red-700 border border-red-200';
  };

  const statusLabel = (status: string) => {
    if (status === 'pending') return 'معلق';
    if (status === 'approved') return 'مقبول';
    return 'مرفوض';
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">لوحة التحكم</h2>
          <p className="text-muted-foreground text-sm mt-1">نظرة عامة على نشاط مجتمع مبادرة تسويقية</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
          <TrendingUp className="w-3.5 h-3.5" />
          آخر تحديث: الآن
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className={`bg-white rounded-2xl border ${border} p-5 hover:shadow-md transition-all hover:-translate-y-0.5`}>
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {isLoading
                ? <div className="h-8 w-12 bg-gray-100 rounded-lg animate-pulse" />
                : (value ?? 0)
              }
            </div>
            <div className="text-xs text-muted-foreground font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-foreground">آخر الأعضاء</h3>
            </div>
            <Link href="/admin/members" className="text-xs text-primary hover:underline flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-gray-100 rounded-lg mb-2 w-1/2" />
                    <div className="h-3 bg-gray-50 rounded-lg w-1/3" />
                  </div>
                </div>
              ))
              : data?.recentMembers?.length === 0
                ? <div className="p-8 text-center text-muted-foreground text-sm">لا يوجد أعضاء بعد</div>
                : data?.recentMembers?.map((m: any) => (
                  <div key={m.id} className="p-4 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {m.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{m.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{m.city} · {m.specialization}</div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0 bg-muted/50 px-2 py-1 rounded-lg">{formatDate(m.created_at)}</div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="font-bold text-foreground">آخر الطلبات</h3>
            </div>
            <Link href="/admin/applications" className="text-xs text-primary hover:underline flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-3.5 bg-gray-100 rounded-lg mb-2 w-1/2" />
                  <div className="h-3 bg-gray-50 rounded-lg w-1/3" />
                </div>
              ))
              : data?.recentApplications?.length === 0
                ? <div className="p-8 text-center text-muted-foreground text-sm">لا توجد طلبات بعد</div>
                : data?.recentApplications?.map((app: any) => (
                  <div key={app.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm text-foreground">{app.full_name}</div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusBadge(app.status)}`}>
                        {statusLabel(app.status)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{app.email} · {app.city}</div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
