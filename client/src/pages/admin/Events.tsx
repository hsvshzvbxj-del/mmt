import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from '../../hooks/useToast';
import { Plus, Trash2, Edit, X, Calendar } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import Toaster from '../../components/ui/Toaster';

const emptyForm = { title: '', description: '', location: '', event_date: '', seats: 0, zoom_link: '', is_online: false };

export default function AdminEvents() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm as any);

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api.get('/events').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => editId ? api.put(`/events/${editId}`, data) : api.post('/events', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      setShowModal(false); setEditId(null); setForm(emptyForm);
      toast(editId ? 'تم تحديث الفعالية' : 'تم إنشاء الفعالية بنجاح!', 'success');
    },
    onError: () => toast('حدث خطأ', 'error'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); toast('تم حذف الفعالية', 'success'); },
    onError: () => toast('حدث خطأ', 'error'),
  });

  const openEdit = (e: any) => {
    setEditId(e.id);
    setForm({ ...e, event_date: e.event_date?.slice(0, 16) });
    setShowModal(true);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    create.mutate(form);
  };

  return (
    <div className="animate-fade-in">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة الفعاليات</h2>
          <p className="text-muted-foreground text-sm">{events?.length || 0} فعالية</p>
        </div>
        <button onClick={() => { setEditId(null); setForm(emptyForm); setShowModal(true); }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> فعالية جديدة
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-bold">{editId ? 'تعديل الفعالية' : 'فعالية جديدة'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { key: 'title', label: 'العنوان *', type: 'text', required: true },
                { key: 'location', label: 'الموقع', type: 'text' },
                { key: 'event_date', label: 'التاريخ والوقت *', type: 'datetime-local', required: true },
                { key: 'seats', label: 'عدد المقاعد', type: 'number' },
                { key: 'zoom_link', label: 'رابط Zoom', type: 'url' },
              ].map(({ key, label, type, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                  <input type={type} required={required} value={(form as any)[key] || ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">الوصف</label>
                <textarea rows={3} value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_online" checked={form.is_online} onChange={e => setForm((p: any) => ({ ...p, is_online: e.target.checked }))}
                  className="h-4 w-4 rounded accent-primary" />
                <label htmlFor="is_online" className="text-sm font-medium text-foreground">فعالية أونلاين</label>
              </div>
              <button type="submit" disabled={create.isPending}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-60">
                {create.isPending ? 'جارٍ الحفظ...' : editId ? 'تحديث' : 'إنشاء'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border p-5 h-20 animate-pulse" />)}</div>
      ) : events?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد فعاليات بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events?.map((e: any) => (
            <div key={e.id} className="bg-white rounded-xl border p-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground truncate">{e.title}</h3>
                  {e.is_online && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">أونلاين</span>}
                </div>
                <div className="text-sm text-muted-foreground">{formatDateTime(e.event_date)} · {e.registered_count}/{e.seats || '∞'} مشارك</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(e)} className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center hover:bg-blue-200 transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('حذف الفعالية؟')) remove.mutate(e.id); }} className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
