import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from '../../hooks/useToast';
import { Plus, Trash2, Edit, X, BookOpen } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import Toaster from '../../components/ui/Toaster';

const categories = ['Industry Insights', 'Digital Marketing', 'Brand Strategy', 'Content Marketing', 'Analytics'];
const categoryLabels: Record<string, string> = {
  'Industry Insights': 'رؤى الصناعة', 'Digital Marketing': 'التسويق الرقمي',
  'Brand Strategy': 'استراتيجية العلامة', 'Content Marketing': 'تسويق المحتوى', 'Analytics': 'التحليلات',
};
const emptyForm = { title: '', content: '', category: 'Industry Insights', cover_image: '', is_published: true };

export default function AdminArticles() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm as any);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => api.get('/articles').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => editId ? api.put(`/articles/${editId}`, data) : api.post('/articles', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-articles'] });
      setShowModal(false); setEditId(null); setForm(emptyForm);
      toast(editId ? 'تم تحديث المقال' : 'تم نشر المقال!', 'success');
    },
    onError: () => toast('حدث خطأ', 'error'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/articles/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-articles'] }); toast('تم الحذف', 'success'); },
  });

  const openEdit = (a: any) => {
    setEditId(a.id);
    setForm({ title: a.title, content: a.content, category: a.category, cover_image: a.cover_image || '', is_published: a.is_published });
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة المقالات</h2>
          <p className="text-muted-foreground text-sm">{articles?.length || 0} مقال</p>
        </div>
        <button onClick={() => { setEditId(null); setForm(emptyForm); setShowModal(true); }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90">
          <Plus className="w-4 h-4" /> مقال جديد
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-bold">{editId ? 'تعديل المقال' : 'مقال جديد'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">عنوان المقال *</label>
                <input type="text" required value={form.title} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">التصنيف</label>
                <select value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {categories.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">المحتوى *</label>
                <textarea required rows={8} value={form.content} onChange={e => setForm((p: any) => ({ ...p, content: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_pub" checked={form.is_published} onChange={e => setForm((p: any) => ({ ...p, is_published: e.target.checked }))}
                  className="h-4 w-4 rounded accent-primary" />
                <label htmlFor="is_pub" className="text-sm font-medium">نشر المقال</label>
              </div>
              <button type="submit" disabled={create.isPending}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-60">
                {create.isPending ? 'جارٍ الحفظ...' : editId ? 'تحديث' : 'نشر'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border p-5 h-20 animate-pulse" />)}</div>
      ) : articles?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد مقالات بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles?.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl border p-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground truncate">{a.title}</h3>
                  {!a.is_published && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">مسودة</span>}
                </div>
                <div className="text-sm text-muted-foreground">{categoryLabels[a.category] || a.category} · {a.author_name} · {formatDate(a.created_at)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(a)} className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center hover:bg-blue-200"><Edit className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('حذف المقال؟')) remove.mutate(a.id); }} className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
