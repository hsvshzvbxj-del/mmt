import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import api from '../lib/api';
import { BookOpen, Tag, Clock, User, ChevronLeft } from 'lucide-react';
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

const categoryColors: Record<string, string> = {
  'Industry Insights': 'bg-blue-50 text-blue-700',
  'Digital Marketing': 'bg-violet-50 text-violet-700',
  'Brand Strategy': 'bg-rose-50 text-rose-700',
  'Content Marketing': 'bg-amber-50 text-amber-700',
  'Analytics': 'bg-emerald-50 text-emerald-700',
};

export default function KnowledgePage() {
  const [category, setCategory] = useState('');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', category],
    queryFn: () => api.get('/articles', { params: category ? { category } : {} }).then(r => r.data),
  });

  return (
    <div className="animate-fade-in">
      <section className="bg-[#0a1526] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-secondary/15 text-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">المعرفة</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">مركز المعرفة</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-loose">مقالات وموارد تسويقية متخصصة من قادة الصناعة في العالم العربي</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Category filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                category === c
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-white border hover:border-primary/40 hover:shadow-sm'
              }`}
            >
              {categoryLabels[c] || c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
                <div className="h-44 bg-gray-100 rounded-xl mb-5" />
                <div className="h-4 bg-gray-100 rounded-lg mb-3 w-1/3" />
                <div className="h-5 bg-gray-100 rounded-lg mb-2" />
                <div className="h-4 bg-gray-50 rounded-lg w-2/3" />
              </div>
            ))}
          </div>
        ) : articles?.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">لا توجد مقالات في هذا القسم</h3>
            <p className="text-muted-foreground text-sm">اختر تصنيفاً آخر أو تابعنا للمحتوى القادم</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles?.map((article: any) => (
              <Link key={article.id} href={`/knowledge/${article.id}`}>
                <div className="bg-white rounded-2xl border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group cursor-pointer">
                  <div className="h-44 bg-gradient-to-br from-[#0a1526] to-[#1e3a5f] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(232,165,184,0.5), transparent 60%)'}} />
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                      <BookOpen className="w-7 h-7 text-white/70" />
                    </div>
                  </div>
                  <div className="p-6">
                    {article.category && (
                      <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${categoryColors[article.category] || 'bg-gray-50 text-gray-600'}`}>
                        <Tag className="w-3 h-3" />
                        {categoryLabels[article.category] || article.category}
                      </div>
                    )}
                    <h3 className="font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-snug">{article.title}</h3>
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
                  <div className="px-6 py-3.5 border-t bg-muted/20">
                    <span className="flex items-center gap-1 text-sm text-primary font-semibold group-hover:gap-2 transition-all">
                      اقرأ المقال <ChevronLeft className="w-4 h-4" />
                    </span>
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
