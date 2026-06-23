import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Users, UserPlus, ClipboardList, Calendar, Briefcase, MessageSquare, BookOpen, TrendingUp } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
  });

  const stats = [
    { icon: Users, label: 'إجمالي الأعضاء', value: data?.stats.totalMembers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: UserPlus, label: 'أعضاء جدد (30 يوم)', value: data?.stats.newMembers, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: ClipboardList, label: 'طلبات معلقة', value: data?.stats.pendingApplications, color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Calendar, label: 'الفعاليات', value: data?.stats.totalEvents, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Briefcase, label: 'الفرص', value: data?.stats.totalOpportunities, color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: MessageSquare, label: 'النقاشات', value: data?.stats.totalDiscussions, color: 'text-pink-600', bg: 'bg-pink-50' },
    { icon: BookOpen, label: 'المقالات', value: data?.stats.totalArticles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">لوحة التحكم</h2>
        <p className="text-muted-foreground text-sm">نظرة عامة على نشاط المجتمع</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {isLoading ? <div className="h-8 w-12 bg-gray-100 rounded animate-pulse" /> : value ?? 0}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white rounded-xl border">
          <div className="p-5 border-b flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground">آخر الأعضاء</h3>
          </div>
          <div className="divide-y">
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-100 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded mb-1 w-1/2" />
                  <div className="h-3 bg-gray-50 rounded w-1/3" />
                </div>
              </div>
            )) : data?.recentMembers?.map((m: any) => (
              <div key={m.id} className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {m.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.city} · {m.specialization}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{formatDate(m.created_at)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl border">
          <div className="p-5 border-b flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground">آخر الطلبات</h3>
          </div>
          <div className="divide-y">
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded mb-2 w-1/2" />
                <div className="h-3 bg-gray-50 rounded w-1/3" />
              </div>
            )) : data?.recentApplications?.map((app: any) => (
              <div key={app.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm text-foreground">{app.full_name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    app.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    app.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {app.status === 'pending' ? 'معلق' : app.status === 'approved' ? 'مقبول' : 'مرفوض'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{app.email} · {app.city}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
