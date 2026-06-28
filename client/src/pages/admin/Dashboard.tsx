import { useEffect, useState } from 'react';
import api from '../../lib/api';

interface DashboardData {
  stats: {
    totalMembers: number; newMembers: number; weeklyMembers: number;
    pendingApplications: number; approvedApplications: number; rejectedApplications: number;
    totalEvents: number; totalOpportunities: number; totalDiscussions: number; totalArticles: number;
    totalBanned: number; totalMuted: number; totalSuspended: number; pendingReports: number;
  };
  growthByMonth: { month: string; count: number }[];
  recentMembers: any[];
  recentApplications: any[];
  recentActivity: any[];
}

function StatCard({ title, value, sub, color, icon }: { title: string; value: number; sub?: string; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl shrink-0`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value?.toLocaleString('ar') ?? 0}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const ACTION_LABELS: Record<string, string> = {
  'user.login': 'تسجيل دخول', 'user.logout': 'تسجيل خروج', 'user.ban': 'حظر مستخدم',
  'user.unban': 'رفع حظر', 'user.mute': 'كتم مستخدم', 'user.unmute': 'رفع كتم',
  'user.role_change': 'تغيير الدور', 'user.update': 'تحديث الملف', 'user.delete': 'حذف مستخدم',
  'member.approve': 'قبول عضوية', 'member.reject': 'رفض عضوية',
  'event.create': 'إنشاء فعالية', 'event.delete': 'حذف فعالية',
  'discussion.create': 'نقاش جديد', 'discussion.delete': 'حذف نقاش',
  'article.create': 'مقال جديد', 'report.create': 'بلاغ جديد',
  'onboarding.complete': 'إكمال التهيئة',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  );

  if (!data) return <div className="p-6 text-red-500">خطأ في تحميل البيانات</div>;

  const { stats, growthByMonth, recentMembers, recentApplications, recentActivity } = data;
  const maxGrowth = Math.max(...(growthByMonth || []).map(m => m.count), 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-primary">لوحة التحكم</h1>
        <p className="text-sm text-gray-400">{new Date().toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="الأعضاء النشطون" value={stats.totalMembers} sub={`+${stats.weeklyMembers} هذا الأسبوع`} color="bg-blue-50" icon="👥" />
        <StatCard title="أعضاء جدد (30 يوم)" value={stats.newMembers} color="bg-green-50" icon="🌱" />
        <StatCard title="طلبات معلقة" value={stats.pendingApplications} color="bg-amber-50" icon="📋" />
        <StatCard title="بلاغات معلقة" value={stats.pendingReports} color="bg-red-50" icon="🚨" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="الفعاليات" value={stats.totalEvents} color="bg-purple-50" icon="🗓️" />
        <StatCard title="الفرص" value={stats.totalOpportunities} color="bg-indigo-50" icon="💼" />
        <StatCard title="النقاشات" value={stats.totalDiscussions} color="bg-teal-50" icon="💬" />
        <StatCard title="المقالات" value={stats.totalArticles} color="bg-rose-50" icon="📝" />
      </div>

      {/* Moderation overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{stats.totalBanned}</p>
          <p className="text-sm text-red-500 mt-1">محظورون</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{stats.totalMuted}</p>
          <p className="text-sm text-amber-500 mt-1">مكتومون</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{stats.totalSuspended}</p>
          <p className="text-sm text-orange-500 mt-1">موقوفون</p>
        </div>
      </div>

      {/* Growth chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4">نمو الأعضاء (آخر 6 أشهر)</h2>
        <div className="flex items-end gap-3 h-32">
          {(growthByMonth || []).map(m => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">{m.count}</span>
              <div
                className="w-full bg-primary/80 rounded-t-lg transition-all"
                style={{ height: `${(m.count / maxGrowth) * 100}%`, minHeight: m.count > 0 ? '4px' : '0' }}
              />
              <span className="text-[10px] text-gray-400 text-center">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent members */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">آخر الأعضاء</h2>
          <div className="space-y-3">
            {(recentMembers || []).map((m: any) => (
              <div key={m._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {m.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-gray-400 truncate">{m.specialization || m.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  ['admin', 'super_admin'].includes(m.role) ? 'bg-red-100 text-red-600' :
                  ['moderator', 'senior_moderator'].includes(m.role) ? 'bg-purple-100 text-purple-600' :
                  'bg-green-100 text-green-600'
                }`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent applications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">آخر الطلبات</h2>
          <div className="space-y-3">
            {(recentApplications || []).map((a: any) => (
              <div key={a._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {a.fullName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{a.specialization || a.city}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  a.status === 'approved' ? 'bg-green-100 text-green-600' :
                  a.status === 'rejected' ? 'bg-red-100 text-red-600' :
                  'bg-amber-100 text-amber-600'
                }`}>{a.status === 'pending' ? 'معلق' : a.status === 'approved' ? 'مقبول' : 'مرفوض'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">سجل الأنشطة الأخيرة</h2>
          <div className="space-y-3">
            {(recentActivity || []).map((log: any) => (
              <div key={log._id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.performedBy?.name}</span>{' '}
                    <span className="text-gray-500">{ACTION_LABELS[log.action] || log.action}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleString('ar', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
