import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import api from '../lib/api';
import { ArrowRight, Clock, User, Tag } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function ArticlePage() {
  const { id } = useParams();
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => api.get(`/articles/${id}`).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="container mx-auto px-4 py-16 max-w-3xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4" />
      <div className="h-4 bg-gray-100 rounded mb-2 w-1/3" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
      </div>
    </div>
  );

  if (!article) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">لم يتم العثور على المقال</p>
      <Link href="/knowledge" className="text-primary hover:underline mt-2 block">العودة لمركز المعرفة</Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl animate-fade-in">
      <Link href="/knowledge" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowRight className="w-4 h-4" /> مركز المعرفة
      </Link>

      <article className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="h-64 bg-gradient-to-br from-primary to-[#2a4a7f] flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white text-center px-8 leading-tight">{article.title}</h1>
        </div>

        <div className="p-8">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b">
            {article.author_name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {article.author_name}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {formatDate(article.created_at)}
            </div>
            {article.category && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                {article.category}
              </div>
            )}
          </div>

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </div>
      </article>
    </div>
  );
}
