import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from '../../hooks/useToast';
import { Plus, Trash2, Edit, X, Briefcase } from 'lucide-react';
import { getTypeColor, formatDate } from '../../lib/utils';
import Toaster from '../../components/ui/Toaster';

const typeLabels: Record<string, string> = { job: 'وظيفة', project: 'مشروع', consulting: 'استشارة', partnership: 'شراكة' };
const emptyForm = { title: '', description: '', company: '', type: 'job', deadline: '', status: 'active' };

export default function AdminOpportunities() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm as any);

  const { data: opps, isLoading } = useQuery({
    queryKey: ['admin-opportunities'],
    queryFn: () => api.get('/opportunities').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => editId ? api.put(`/opportunities/${editId}`, data) : api.post('/opportunities', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-opportunities'] });
      setShowModal(false); setEditId(null); setForm(emptyForm);
      toast(editId ? 'تم تحديث الفرصة' : 'تم إنشاء الفرصة!', 'success');
    },
    onError: () => toast('حدث خطأ', 'error'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/opportunities/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-opportunities'] }); toast('تم الحذف', 'success'); },
  });

  const openEdit = (o: any) => {
    setEditId(o.id);
    setForm({ ...o, deadline: o.deadline?.slice(0, 10) });
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة الفرص</h2>
          <p className="text-muted-foreground text-sm">{opps?.length || 0} فرصة</p>
        </div>
        <button onClick={() => { setEditId(null); setForm(emptyForm); setShowModal(true); }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90">
          <Plus className="w-4 h-4" /> فرصة جديدة
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-bold">{editId ? 'تعديل الفرصة' : 'فرصة جديدة'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="p-6 space-y-4">
              {[
                { key: 'title', label: 'العنوان *', type: 'text', required: true },
                { key: 'company', label: 'الشركة', type: 'text' },
                { key: 'deadline', label: 'آخر موعد', type: 'date' },
              ].map(({ key, label, type, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                  <input type={type} required={required} value={(form as any)[key] || ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">النوع</label>
                <select value={form.type} onChange={e => setForm((p: any) => ({ ...p, type: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">الوصف</label>
                <textarea rows={3} value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
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
      ) : opps?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد فرص بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {opps?.map((o: any) => (
            <div key={o.id} className="bg-white rounded-xl border p-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground truncate">{o.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getTypeColor(o.type)}`}>
                    {typeLabels[o.type]}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{o.company || '-'} · {o.deadline ? `آخر موعد: ${formatDate(o.deadline)}` : 'لا يوجد موعد'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(o)} className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center hover:bg-blue-200"><Edit className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('حذف؟')) remove.mutate(o.id); }} className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
