import { useState, useEffect } from 'react';
import api from '../../lib/api';

const ACTION_LABELS: Record<string, string> = {
  'user.login': 'تسجيل دخول', 'user.logout': 'تسجيل خروج',
  'user.ban': 'حظر مستخدم', 'user.unban': 'رفع حظر',
  'user.mute': 'كتم', 'user.unmute': 'رفع كتم',
  'user.role_change': 'تغيير الدور', 'user.update': 'تحديث الملف',
  'user.delete': 'حذف مستخدم', 'user.password_change': 'تغيير كلمة المرور',
  'member.approve': 'قبول عضوية', 'member.reject': 'رفض عضوية',
  'event.create': 'إنشاء فعالية', 'event.delete': 'حذف فعالية',
  'discussion.create': 'نقاش جديد', 'discussion.delete': 'حذف نقاش',
  'article.create': 'مقال جديد', 'article.delete': 'حذف مقال',
  'report.create': 'بلاغ جديد', 'report.resolve': 'حل بلاغ',
  'onboarding.complete': 'إكمال التهيئة',
};

const ACTION_COLORS: Record<string, string> = {
  'user.login': 'bg-green-100 text-green-700',
  'user.ban': 'bg-red-100 text-red-700',
  'user.unban': 'bg-teal-100 text-teal-700',
  'user.delete': 'bg-red-100 text-red-700',
  'user.role_change': 'bg-purple-100 text-purple-700',
  'member.approve': 'bg-green-100 text-green-700',
  'member.reject': 'bg-red-100 text-red-700',
  'report.create': 'bg-orange-100 text-orange-700',
};

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '30', skip: String((page - 1) * 30) });
      if (filterAction) params.set('action', filterAction);
      const res = await api.get(`/audit?${params}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, filterAction]);

  const pages = Math.ceil(total / 30);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">سجل الأنشطة (Audit Log)</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString('ar')} نشاط مسجل</p>
        </div>
        <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary">
          <option value="">كل الأنشطة</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">لا توجد أنشطة مسجلة</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log: any) => (
              <div key={log._id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="shrink-0 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{log.performedBy?.name || 'النظام'}</span>
                    <span className="text-xs text-gray-400">({log.performedBy?.role})</span>
                    {log.targetUser && (
                      <>
                        <span className="text-xs text-gray-400">←</span>
                        <span className="text-sm text-gray-600">{log.targetUser?.name}</span>
                      </>
                    )}
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                  {new Date(log.createdAt).toLocaleString('ar', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">صفحة {page} من {pages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                السابق
              </button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
