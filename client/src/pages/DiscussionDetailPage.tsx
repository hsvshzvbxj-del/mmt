import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import api from '../lib/api';
import { toast } from '../hooks/useToast';
import { Heart, Bookmark, MessageSquare, Send, ArrowRight, Tag } from 'lucide-react';
import { getInitials, timeAgo } from '../lib/utils';
import Toaster from '../components/ui/Toaster';

export default function DiscussionDetailPage() {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const qc = useQueryClient();

  const { data: discussion, isLoading } = useQuery({
    queryKey: ['discussion', id],
    queryFn: () => api.get(`/discussions/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const addComment = useMutation({
    mutationFn: (content: string) => api.post(`/discussions/${id}/comments`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discussion', id] });
      setComment('');
      toast('تم نشر تعليقك', 'success');
    },
    onError: (err: any) => toast(err.response?.data?.error || 'حدث خطأ', 'error'),
  });

  const like = useMutation({
    mutationFn: () => api.post(`/discussions/${id}/like`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discussion', id] }),
  });

  const saveMutation = useMutation({
    mutationFn: () => api.post(`/discussions/${id}/save`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discussion', id] });
      toast(discussion?.is_saved ? 'تم إلغاء الحفظ' : 'تم حفظ النقاش', 'success');
    },
  });

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment.mutate(comment.trim());
  };

  const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];

  if (isLoading) return (
    <div className="container mx-auto px-4 py-16 max-w-3xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4" />
      <div className="h-4 bg-gray-100 rounded mb-2 w-1/3" />
    </div>
  );

  if (!discussion) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">لم يتم العثور على النقاش</p>
      <Link href="/discussions" className="text-primary hover:underline mt-2 block">العودة للنقاشات</Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl animate-fade-in">
      <Toaster />
      <Link href="/discussions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowRight className="w-4 h-4" /> النقاشات
      </Link>

      {/* Discussion */}
      <div className="bg-white rounded-2xl border shadow-sm mb-6">
        <div className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
              {getInitials(discussion.author_name || 'U')}
            </div>
            <div>
              <div className="font-bold text-foreground">{discussion.author_name}</div>
              {discussion.author_specialization && <div className="text-sm text-muted-foreground">{discussion.author_specialization}</div>}
              <div className="text-xs text-muted-foreground mt-1">{timeAgo(discussion.created_at)}</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-4 leading-snug">{discussion.title}</h1>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap mb-6">{discussion.content}</p>

          {discussion.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {discussion.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Tag className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-6 border-t">
            <button onClick={() => like.mutate()} className={`flex items-center gap-1.5 text-sm transition-colors ${discussion.is_liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}>
              <Heart className={`w-5 h-5 ${discussion.is_liked ? 'fill-red-500' : ''}`} />
              {discussion.likes_count} إعجاب
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="w-5 h-5" />
              {discussion.comments_count} تعليق
            </div>
            <button onClick={() => saveMutation.mutate()} className={`flex items-center gap-1.5 text-sm mr-auto transition-colors ${discussion.is_saved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              <Bookmark className={`w-5 h-5 ${discussion.is_saved ? 'fill-primary' : ''}`} />
              {discussion.is_saved ? 'محفوظ' : 'حفظ'}
            </button>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-foreground">التعليقات ({discussion.comments?.length || 0})</h2>
        </div>

        <div className="divide-y">
          {discussion.comments?.map((c: any, i: number) => (
            <div key={c.id} className="p-6 flex items-start gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                {getInitials(c.author_name || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">{c.author_name}</span>
                  <span className="text-xs text-muted-foreground mr-auto">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t">
          <form onSubmit={handleComment} className="flex gap-3">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              placeholder="أضف تعليقاً..."
              className="flex-1 border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
            <button type="submit" disabled={addComment.isPending || !comment.trim()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 self-end">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
