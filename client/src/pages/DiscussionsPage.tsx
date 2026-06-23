import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import api from '../lib/api';
import { toast } from '../hooks/useToast';
import { MessageSquare, Heart, Bookmark, Plus, X, Tag } from 'lucide-react';
import { timeAgo, getInitials } from '../lib/utils';
import Toaster from '../components/ui/Toaster';

const avatarColors = [
  'from-blue-500 to-blue-600',
  'from-violet-500 to-violet-600',
  'from-emerald-500 to-emerald-600',
  'from-orange-500 to-orange-600',
  'from-rose-500 to-rose-600',
];

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

  return (
    <div className="animate-fade-in">
      <Toaster />

      <section className="bg-[#0a1526] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="inline-block bg-secondary/15 text-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">المجتمع</div>
              <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">النقاشات</h1>
              <p className="text-white/60 text-lg leading-loose">شارك أفكارك وتجاربك مع نخبة المسوقين في العالم العربي</p>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="hidden md:flex bg-secondary text-[#0a1526] px-6 py-3 rounded-xl font-bold text-sm items-center gap-2 hover:bg-secondary/90 transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <Plus className="w-4 h-4" /> نقاش جديد
            </button>
          </div>
        </div>
      </section>

      {/* Mobile new button */}
      <div className="md:hidden container mx-auto px-4 pt-6">
        <button
          onClick={() => setShowNew(true)}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> نقاش جديد
        </button>
      </div>

      {/* New Discussion Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-foreground">نقاش جديد</h2>
              <button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">عنوان النقاش *</label>
                <input
                  type="text" required
                  value={newForm.title}
                  onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                  placeholder="ما الذي تريد مناقشته؟"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">تفاصيل النقاش *</label>
                <textarea
                  required rows={4}
                  value={newForm.content}
                  onChange={e => setNewForm(p => ({ ...p, content: e.target.value }))}
                  className="w-full border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-background"
                  placeholder="اكتب تفاصيل نقاشك هنا..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">العلامات (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={newForm.tags}
                  onChange={e => setNewForm(p => ({ ...p, tags: e.target.value }))}
                  className="w-full border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                  placeholder="تسويق رقمي، AI، محتوى"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={create.isPending}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-sm"
                >
                  {create.isPending ? 'جارٍ النشر...' : 'نشر النقاش'}
                </button>
                <button
                  type="button" onClick={() => setShowNew(false)}
                  className="px-5 border rounded-xl text-sm hover:bg-muted transition-colors font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded mb-2 w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
                <div className="h-3 bg-gray-50 rounded mb-2" />
                <div className="h-3 bg-gray-50 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : discussions?.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">لا توجد نقاشات بعد</h3>
            <p className="text-muted-foreground text-sm mb-6">كن أول من يبدأ نقاشاً في المجتمع</p>
            <button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm">
              ابدأ أول نقاش
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions?.map((d: any, i: number) => (
              <div key={d.id} className="bg-white rounded-2xl border hover:shadow-md transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 bg-gradient-to-br ${avatarColors[i % avatarColors.length]} shadow-sm`}>
                      {getInitials(d.author_name || 'U')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{d.author_name}</span>
                        {d.author_specialization && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{d.author_specialization}</span>
                        )}
                        <span className="text-xs text-muted-foreground mr-auto">{timeAgo(d.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/discussions/${d.id}`}>
                    <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer mb-2 leading-snug">{d.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{d.content}</p>

                  {d.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {d.tags.map((tag: string) => (
                        <span key={tag} className="text-xs bg-primary/8 text-primary px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                          <Tag className="w-3 h-3" />{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-5 pt-4 border-t">
                    <button
                      onClick={() => like.mutate(d.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${d.is_liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-400'}`}
                    >
                      <Heart className={`w-4 h-4 ${d.is_liked ? 'fill-rose-500' : ''}`} />
                      <span className="font-medium">{d.likes_count}</span>
                    </button>
                    <Link href={`/discussions/${d.id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span>{d.comments_count} تعليق</span>
                    </Link>
                    <button
                      onClick={() => save.mutate(d.id)}
                      className={`flex items-center gap-1.5 text-sm mr-auto transition-colors ${d.is_saved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    >
                      <Bookmark className={`w-4 h-4 ${d.is_saved ? 'fill-primary' : ''}`} />
                      <span>{d.is_saved ? 'محفوظ' : 'حفظ'}</span>
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
