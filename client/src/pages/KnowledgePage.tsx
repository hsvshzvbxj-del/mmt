import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import api from '../lib/api';
import { BookOpen, Tag, Clock, User } from 'lucide-react';
import { formatDate } from '../lib/utils';

const categories = ['', 'Industry Insights', 'Digital Marketing', 'Brand Strategy', 'Content Marketing', 'Analytics'];
const categoryLabels: Record<string, string> = {
  '': 'الجميع',
  'Industry Insights': 'رؤى الصناعة',
  'Digital Marketing': 'التسويق الرقمي',
  'Brand Strategy': 'استراتيجية العلامة',
  'Content Marketing': 'تسويق المحتوى',
  'Analytics': 'التحليلات',
};

export default function KnowledgePage() {
  const [category, setCategory] = useState('');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', category],
    queryFn: () => api.get('/articles', { params: category ? { category } : {} }).then(r => r.data),
  });

  return (
    <div className="animate-fade-in">
      <section className="bg-[#0a1526] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">مركز المعرفة</h1>
          <p className="text-white/70">مقالات وموارد ومحتوى تسويقي متخصص</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === c ? 'bg-primary text-primary-foreground' : 'bg-white border hover:border-primary/50'}`}
            >
              {categoryLabels[c] || c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-4" />
                <div className="h-5 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : articles?.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد مقالات في هذا القسم</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles?.map((article: any) => (
              <Link key={article.id} href={`/knowledge/${article.id}`}>
                <div className="bg-white rounded-xl border hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden group cursor-pointer">
                  <div className="h-48 bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white/50" />
                  </div>
                  <div className="p-6">
                    {article.category && (
                      <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-2">
                        <Tag className="w-3.5 h-3.5" />
                        {categoryLabels[article.category] || article.category}
                      </div>
                    )}
                    <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">{article.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {article.author_name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(article.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
