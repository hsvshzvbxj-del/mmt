import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from '../../hooks/useToast';

interface Report {
  _id: string;
  reportedBy: { name: string; avatarUrl?: string };
  targetType: string;
  targetId: string;
  targetUser?: { name: string };
  type: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface BannedUser {
  _id: string;
  name: string;
  email: string;
  banInfo: {
    isBanned: boolean;
    banType: string;
    reason: string;
    bannedAt: string;
    expiresAt?: string;
    appealStatus: string;
    appealText?: string;
  };
}

interface MutedUser {
  _id: string;
  name: string;
  email: string;
  muteInfo: {
    isMuted: boolean;
    reason: string;
    mutedAt: string;
    expiresAt?: string;
  };
}

const TYPE_LABELS: Record<string, string> = {
  spam: 'سبام', harassment: 'مضايقة', hate_speech: 'خطاب كراهية',
  misinformation: 'معلومات مضللة', inappropriate: 'محتوى غير لائق', other: 'أخرى',
};

const TARGET_LABELS: Record<string, string> = {
  user: 'مستخدم', discussion: 'نقاش', comment: 'تعليق',
  article: 'مقال', message: 'رسالة', opportunity: 'فرصة',
};

export default function Moderation() {
  const [tab, setTab] = useState<'reports' | 'banned' | 'muted' | 'appeals'>('reports');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [banModal, setBanModal] = useState<{ userId: string; name: string } | null>(null);
  const [banForm, setBanForm] = useState({ banType: 'temporary', reason: '', durationDays: '7' });
  const [muteModal, setMuteModal] = useState<{ userId: string; name: string } | null>(null);
  const [muteForm, setMuteForm] = useState({ reason: '', durationHours: '24' });

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/admin/moderation');
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function resolveReport(id: string, status: string) {
    try {
      await api.put(`/reports/${id}`, { status, action: status === 'dismissed' ? 'لا يوجد انتهاك' : 'تم المراجعة' });
      toast('تم تحديث البلاغ', 'success');
      load();
    } catch {
      toast('حدث خطأ', 'error');
    }
  }

  async function banUser() {
    if (!banModal) return;
    try {
      await api.post(`/ban/ban/${banModal.userId}`, {
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

  async function unbanUser(userId: string, name: string) {
    try {
      await api.post(`/ban/unban/${userId}`, {});
      toast(`تم رفع الحظر عن ${name}`, 'success');
      load();
    } catch {
      toast('حدث خطأ', 'error');
    }
  }

  async function muteUser() {
    if (!muteModal) return;
    try {
      await api.post(`/ban/mute/${muteModal.userId}`, {
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

  async function unmuteUser(userId: string) {
    try {
      await api.post(`/ban/unmute/${userId}`, {});
      toast('تم رفع الكتم', 'success');
      load();
    } catch {
      toast('حدث خطأ', 'error');
    }
  }

  async function resolveAppeal(userId: string, decision: 'approved' | 'rejected') {
    try {
      await api.put(`/ban/appeal/${userId}`, { decision });
      toast(decision === 'approved' ? 'تم قبول الاستئناف' : 'تم رفض الاستئناف', 'success');
      load();
    } catch {
      toast('حدث خطأ', 'error');
    }
  }

  const tabs = [
    { key: 'reports', label: 'البلاغات', count: data?.pendingReports?.length },
    { key: 'banned', label: 'محظورون', count: data?.bannedUsers?.length },
    { key: 'muted', label: 'مكتومون', count: data?.mutedUsers?.length },
    { key: 'appeals', label: 'استئنافات', count: data?.pendingAppeals?.length },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">مركز الإشراف</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${tab === t.key ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">جاري التحميل...</div>
      ) : (
        <>
          {/* Reports */}
          {tab === 'reports' && (
            <div className="space-y-3">
              {(!data?.pendingReports?.length) && <div className="text-center py-16 text-gray-400">لا توجد بلاغات معلقة ✓</div>}
              {data?.pendingReports?.map((r: Report) => (
                <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">{TYPE_LABELS[r.type] || r.type}</span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{TARGET_LABELS[r.targetType] || r.targetType}</span>
                      {r.targetUser && <span className="text-xs text-gray-500">ضد: <strong>{r.targetUser.name}</strong></span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">{r.reportedBy?.name}</span> أبلغ عن هذا المحتوى
                    </p>
                    {r.description && <p className="text-sm text-gray-500 italic">"{r.description}"</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('ar')}</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    {r.targetUser && (
                      <button onClick={() => setBanModal({ userId: (r.targetUser as any)._id || r.targetId, name: r.targetUser!.name })}
                        className="text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100">
                        حظر
                      </button>
                    )}
                    <button onClick={() => resolveReport(r._id, 'resolved')}
                      className="text-xs bg-green-50 text-green-600 border border-green-100 px-3 py-1.5 rounded-lg hover:bg-green-100">
                      حل
                    </button>
                    <button onClick={() => resolveReport(r._id, 'dismissed')}
                      className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                      رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Banned */}
          {tab === 'banned' && (
            <div className="space-y-3">
              {(!data?.bannedUsers?.length) && <div className="text-center py-16 text-gray-400">لا يوجد مستخدمون محظورون</div>}
              {data?.bannedUsers?.map((u: BannedUser) => (
                <div key={u._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{u.banInfo.banType}</span>
                      <span className="text-xs text-gray-500">السبب: {u.banInfo.reason}</span>
                    </div>
                    {u.banInfo.expiresAt && (
                      <p className="text-xs text-gray-400 mt-1">ينتهي: {new Date(u.banInfo.expiresAt).toLocaleDateString('ar')}</p>
                    )}
                  </div>
                  <div className="flex gap-2 items-start">
                    <button onClick={() => setMuteModal({ userId: u._id, name: u.name })}
                      className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-100">
                      كتم
                    </button>
                    <button onClick={() => unbanUser(u._id, u.name)}
                      className="text-xs bg-green-50 text-green-600 border border-green-100 px-3 py-1.5 rounded-lg hover:bg-green-100">
                      رفع الحظر
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Muted */}
          {tab === 'muted' && (
            <div className="space-y-3">
              {(!data?.mutedUsers?.length) && <div className="text-center py-16 text-gray-400">لا يوجد مستخدمون مكتومون</div>}
              {data?.mutedUsers?.map((u: MutedUser) => (
                <div key={u._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    <p className="text-xs text-gray-500 mt-1">السبب: {u.muteInfo.reason}</p>
                    {u.muteInfo.expiresAt && (
                      <p className="text-xs text-gray-400">ينتهي: {new Date(u.muteInfo.expiresAt).toLocaleDateString('ar')}</p>
                    )}
                  </div>
                  <button onClick={() => unmuteUser(u._id)}
                    className="text-xs bg-green-50 text-green-600 border border-green-100 px-3 py-1.5 rounded-lg hover:bg-green-100 self-start">
                    رفع الكتم
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Appeals */}
          {tab === 'appeals' && (
            <div className="space-y-3">
              {(!data?.pendingAppeals?.length) && <div className="text-center py-16 text-gray-400">لا توجد استئنافات معلقة</div>}
              {data?.pendingAppeals?.map((u: BannedUser) => (
                <div key={u._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-gray-500">سبب الحظر: {u.banInfo.reason}</p>
                      {u.banInfo.appealText && (
                        <div className="mt-2 bg-blue-50 rounded-xl p-3">
                          <p className="text-xs font-medium text-blue-700 mb-1">نص الاستئناف:</p>
                          <p className="text-sm text-blue-800">"{u.banInfo.appealText}"</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 items-start">
                      <button onClick={() => resolveAppeal(u._id, 'approved')}
                        className="text-xs bg-green-50 text-green-600 border border-green-100 px-3 py-1.5 rounded-lg hover:bg-green-100">
                        قبول ورفع الحظر
                      </button>
                      <button onClick={() => resolveAppeal(u._id, 'rejected')}
                        className="text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100">
                        رفض الاستئناف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

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
                  <option value="shadow">Shadow Ban</option>
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
                  placeholder="اذكر سبب الحظر..." rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setBanModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">إلغاء</button>
              <button onClick={banUser} disabled={!banForm.reason.trim()}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm hover:bg-red-600 disabled:opacity-50">
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
                <label className="block text-sm font-medium mb-1">مدة الكتم (ساعات)</label>
                <select value={muteForm.durationHours} onChange={e => setMuteForm(f => ({ ...f, durationHours: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary">
                  {['1', '6', '12', '24', '48', '72', '168'].map(h => (
                    <option key={h} value={h}>{h} ساعة</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">سبب الكتم *</label>
                <textarea value={muteForm.reason} onChange={e => setMuteForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="سبب الكتم..." rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setMuteModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">إلغاء</button>
              <button onClick={muteUser} disabled={!muteForm.reason.trim()}
                className="flex-1 bg-amber-500 text-white rounded-xl py-2.5 text-sm hover:bg-amber-600 disabled:opacity-50">
                تأكيد الكتم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
