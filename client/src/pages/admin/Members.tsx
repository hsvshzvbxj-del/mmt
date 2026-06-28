import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { toast } from '../../hooks/useToast';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'المدير الأعلى', admin: 'مدير', moderator: 'مشرف',
  senior_moderator: 'مشرف أول', editor: 'محرر', reviewer: 'مراجع',
  support: 'دعم', member: 'عضو', guest: 'زائر',
};
const STATUS_LABELS: Record<string, string> = {
  active: 'نشط', inactive: 'غير نشط', pending: 'معلق',
  suspended: 'موقوف', banned: 'محظور', muted: 'مكتوم', archived: 'مؤرشف',
};
const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700', admin: 'bg-red-50 text-red-600',
  moderator: 'bg-purple-100 text-purple-700', senior_moderator: 'bg-purple-50 text-purple-600',
  editor: 'bg-blue-100 text-blue-700', reviewer: 'bg-indigo-100 text-indigo-700',
  support: 'bg-teal-100 text-teal-700', member: 'bg-green-100 text-green-700',
  guest: 'bg-gray-100 text-gray-600',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700', inactive: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700', suspended: 'bg-orange-100 text-orange-700',
  banned: 'bg-red-100 text-red-700', muted: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-200 text-gray-500',
};

export default function AdminMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState({ role: '', status: '' });
  const [banModal, setBanModal] = useState<{ id: string; name: string } | null>(null);
  const [banForm, setBanForm] = useState({ banType: 'temporary', reason: '', durationDays: '7' });
  const [muteModal, setMuteModal] = useState<{ id: string; name: string } | null>(null);
  const [muteForm, setMuteForm] = useState({ reason: '', durationHours: '24' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (filterRole) params.set('role', filterRole);
      if (filterStatus) params.set('status', filterStatus);
      const res = await api.get(`/admin/members?${params}`);
      setMembers(res.data.users || []);
      setTotal(res.data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterRole, filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function updateMember(id: string) {
    try {
      await api.put(`/admin/members/${id}`, editData);
      toast('تم تحديث العضو بنجاح', 'success');
      setEditing(null);
      load();
    } catch {
      toast('حدث خطأ', 'error');
    }
  }

  async function deleteMember(id: string, name: string) {
    if (!confirm(`هل تريد حذف ${name}؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;
    try {
      await api.delete(`/admin/members/${id}`);
      toast('تم حذف العضو', 'success');
      load();
    } catch {
      toast('حدث خطأ', 'error');
    }
  }

  async function banUser() {
    if (!banModal) return;
    try {
      await api.post(`/ban/ban/${banModal.id}`, {
        banType: banForm.banType,
        reason: banForm.reason,
        durationDays: Number(banForm.durationDays),
      });
      toast(`تم حظر ${banModal.name}`, 'success');
      setBanModal(null);
      load();
    } catch {
      toast('حدث خطأ', 'error');
    }
  }

  async function unbanUser(id: string, name: string) {
    try {
      await api.post(`/ban/unban/${id}`, {});
      toast(`تم رفع الحظر عن ${name}`, 'success');
      load();
    } catch {
      toast('حدث خطأ', 'error');
    }
  }

  async function muteUser() {
    if (!muteModal) return;
    try {
      await api.post(`/ban/mute/${muteModal.id}`, {
        reason: muteForm.reason,
        durationHours: Number(muteForm.durationHours),
      });
      toast(`تم كتم ${muteModal.name}`, 'success');
      setMuteModal(null);
      load();
    } catch {
      toast('حدث خطأ', 'error');
    }
  }

  const pages = Math.ceil(total / 20);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">إدارة الأعضاء</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString('ar')} عضو إجمالاً</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="بحث بالاسم أو البريد..."
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
        />
        <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
          <option value="">كل الأدوار</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-right px-4 py-3 font-medium text-gray-500 whitespace-nowrap">العضو</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 whitespace-nowrap">البريد</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 whitespace-nowrap">الدور</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 whitespace-nowrap">الحالة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 whitespace-nowrap">تاريخ الانضمام</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              )) : members.map((m: any) => (
                <tr key={m._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.avatarUrl
                        ? <img src={m.avatarUrl} alt={m.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        : <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">{m.name?.[0]}</div>
                      }
                      <div>
                        <p className="font-medium text-gray-900">{m.name}</p>
                        {m.specialization && <p className="text-xs text-gray-400">{m.specialization}</p>}
                        {m.banInfo?.isBanned && <p className="text-xs text-red-500">🚫 محظور</p>}
                        {m.muteInfo?.isMuted && <p className="text-xs text-amber-500">🔇 مكتوم</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{m.email}</td>
                  <td className="px-4 py-3">
                    {editing === m._id ? (
                      <select value={editData.role} onChange={e => setEditData(p => ({ ...p, role: e.target.value }))}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary">
                        {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[m.role] || 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABELS[m.role] || m.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === m._id ? (
                      <select value={editData.status} onChange={e => setEditData(p => ({ ...p, status: e.target.value }))}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary">
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                        <option value="suspended">موقوف</option>
                        <option value="archived">مؤرشف</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[m.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[m.status] || m.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString('ar')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {editing === m._id ? (
                        <>
                          <button onClick={() => updateMember(m._id)}
                            className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-1 rounded-lg hover:bg-green-100">
                            حفظ
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-1 rounded-lg hover:bg-gray-100">
                            إلغاء
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditing(m._id); setEditData({ role: m.role, status: m.status }); }}
                            className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-lg hover:bg-blue-100">
                            تعديل
                          </button>
                          {m.banInfo?.isBanned ? (
                            <button onClick={() => unbanUser(m._id, m.name)}
                              className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-1 rounded-lg hover:bg-green-100">
                              رفع الحظر
                            </button>
                          ) : (
                            <button onClick={() => setBanModal({ id: m._id, name: m.name })}
                              className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-lg hover:bg-red-100">
                              حظر
                            </button>
                          )}
                          {!m.muteInfo?.isMuted && (
                            <button onClick={() => setMuteModal({ id: m._id, name: m.name })}
                              className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-lg hover:bg-amber-100">
                              كتم
                            </button>
                          )}
                          <button onClick={() => deleteMember(m._id, m.name)}
                            className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-1 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100">
                            حذف
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">صفحة {page} من {pages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="text-sm px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                السابق
              </button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                className="text-sm px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">حظر: {banModal.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">نوع الحظر</label>
                <select value={banForm.banType} onChange={e => setBanForm(f => ({ ...f, banType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option value="temporary">مؤقت</option>
                  <option value="permanent">دائم</option>
                  <option value="shadow">Shadow Ban (يظهر للمستخدم فقط)</option>
                  <option value="soft">Soft Ban</option>
                </select>
              </div>
              {banForm.banType === 'temporary' && (
                <div>
                  <label className="block text-sm font-medium mb-1">المدة (أيام)</label>
                  <input type="number" min="1" max="365" value={banForm.durationDays}
                    onChange={e => setBanForm(f => ({ ...f, durationDays: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">سبب الحظر *</label>
                <textarea value={banForm.reason} onChange={e => setBanForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="اذكر سبب الحظر بوضوح..." rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setBanModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">إلغاء</button>
              <button onClick={banUser} disabled={!banForm.reason.trim()}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm hover:bg-red-600 disabled:opacity-50 font-medium">
                تأكيد الحظر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mute Modal */}
      {muteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">كتم: {muteModal.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">مدة الكتم</label>
                <select value={muteForm.durationHours} onChange={e => setMuteForm(f => ({ ...f, durationHours: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option value="1">ساعة واحدة</option>
                  <option value="6">6 ساعات</option>
                  <option value="12">12 ساعة</option>
                  <option value="24">24 ساعة (يوم)</option>
                  <option value="48">48 ساعة (يومان)</option>
                  <option value="72">72 ساعة (3 أيام)</option>
                  <option value="168">أسبوع</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">سبب الكتم *</label>
                <textarea value={muteForm.reason} onChange={e => setMuteForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="سبب كتم المستخدم..." rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setMuteModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">إلغاء</button>
              <button onClick={muteUser} disabled={!muteForm.reason.trim()}
                className="flex-1 bg-amber-500 text-white rounded-xl py-2.5 text-sm hover:bg-amber-600 disabled:opacity-50 font-medium">
                تأكيد الكتم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
