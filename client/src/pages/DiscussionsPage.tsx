import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import api from '../lib/api';
import { toast } from '../hooks/useToast';
import { MessageSquare, Heart, Bookmark, Plus, X, Tag } from 'lucide-react';
import { timeAgo, getInitials } from '../lib/utils';
import Toaster from '../components/ui/Toaster';

export default function DiscussionsPage() {
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', content: '', tags: '' });
  const qc = useQueryClient();

  const { data: discussions, isLoading } = useQuery({
    queryKey: ['discussions'],
    queryFn: () => api.get('/discussions').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/discussions', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discussions'] });
      setShowNew(false);
      setNewForm({ title: '', content: '', tags: '' });
      toast('تم نشر النقاش بنجاح!', 'success');
    },
    onError: (err: any) => toast(err.response?.data?.error || 'حدث خطأ', 'error'),
  });

  const like = useMutation({
    mutationFn: (id: string) => api.post(`/discussions/${id}/like`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discussions'] }),
  });

  const save = useMutation({
    mutationFn: (id: string) => api.post(`/discussions/${id}/save`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discussions'] });
      toast('تم حفظ النقاش', 'success');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = newForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    create.mutate({ title: newForm.title, content: newForm.content, tags });
  };

  const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];

  return (
    <div className="animate-fade-in">
      <Toaster />
      <section className="bg-[#0a1526] text-white py-16">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">النقاشات</h1>
            <p className="text-white/70">شارك أفكارك وتجاربك مع مجتمع المسوقين</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="bg-secondary text-[#0a1526] px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-secondary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> نقاش جديد
          </button>
        </div>
      </section>

      {/* New Discussion Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">نقاش جديد</h2>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">العنوان *</label>
                <input type="text" required value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="ما الذي تريد مناقشته؟" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">المحتوى *</label>
                <textarea required rows={4} value={newForm.content} onChange={e => setNewForm(p => ({ ...p, content: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  placeholder="اكتب تفاصيل نقاشك هنا..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">العلامات (مفصولة بفاصلة)</label>
                <input type="text" value={newForm.tags} onChange={e => setNewForm(p => ({ ...p, tags: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="تسويق رقمي، AI، محتوى" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={create.isPending}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {create.isPending ? 'جارٍ النشر...' : 'نشر النقاش'}
                </button>
                <button type="button" onClick={() => setShowNew(false)}
                  className="px-5 border rounded-lg text-sm hover:bg-muted transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded mb-3 w-3/4" />
                <div className="h-4 bg-gray-100 rounded mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : discussions?.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">لا توجد نقاشات بعد</p>
            <button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium">
              ابدأ أول نقاش
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions?.map((d: any, i: number) => (
              <div key={d.id} className="bg-white rounded-xl border hover:shadow-sm transition-all">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                      {getInitials(d.author_name || 'U')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">{d.author_name}</span>
                        {d.author_specialization && <span className="text-xs text-muted-foreground">· {d.author_specialization}</span>}
                        <span className="text-xs text-muted-foreground mr-auto">{timeAgo(d.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/discussions/${d.id}`}>
                    <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer mb-2 leading-snug">{d.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">{d.content}</p>

                  {d.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {d.tags.map((tag: string) => (
                        <span key={tag} className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Tag className="w-3 h-3" />{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <button onClick={() => like.mutate(d.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${d.is_liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}>
                      <Heart className={`w-4 h-4 ${d.is_liked ? 'fill-red-500' : ''}`} />
                      {d.likes_count}
                    </button>
                    <Link href={`/discussions/${d.id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      {d.comments_count} تعليق
                    </Link>
                    <button onClick={() => save.mutate(d.id)} className={`flex items-center gap-1.5 text-sm mr-auto transition-colors ${d.is_saved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                      <Bookmark className={`w-4 h-4 ${d.is_saved ? 'fill-primary' : ''}`} />
                      {d.is_saved ? 'محفوظ' : 'حفظ'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
