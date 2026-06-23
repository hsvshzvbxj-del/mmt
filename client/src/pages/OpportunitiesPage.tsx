import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Briefcase, Building, Calendar, ChevronLeft, Layers } from 'lucide-react';
import { formatDate } from '../lib/utils';

const types = ['', 'job', 'project', 'consulting', 'partnership'];
const typeLabels: Record<string, string> = {
  '': 'الجميع',
  job: 'وظيفة',
  project: 'مشروع',
  consulting: 'استشارة',
  partnership: 'شراكة',
};

const typeStyles: Record<string, string> = {
  job: 'bg-blue-50 text-blue-700 border-blue-100',
  project: 'bg-violet-50 text-violet-700 border-violet-100',
  consulting: 'bg-amber-50 text-amber-700 border-amber-100',
  partnership: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export default function OpportunitiesPage() {
  const [typeFilter, setTypeFilter] = useState('');

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities', typeFilter],
    queryFn: () => api.get('/opportunities', { params: typeFilter ? { type: typeFilter } : {} }).then(r => r.data),
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
          <div className="inline-block bg-secondary/15 text-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">لوحة الفرص</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">الفرص المهنية</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-loose">وظائف واستشارات ومشاريع وشراكات حصرية لأعضاء المجتمع</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-10 flex-wrap">
          <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                typeFilter === t
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-white border hover:border-primary/40 text-foreground hover:shadow-sm'
              }`}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded-lg mb-4 w-3/4" />
                <div className="h-4 bg-gray-100 rounded-lg mb-2 w-1/2" />
                <div className="h-16 bg-gray-50 rounded-lg" />
              </div>
            ))}
          </div>
        ) : opportunities?.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">لا توجد فرص في هذا القسم</h3>
            <p className="text-muted-foreground text-sm">جرّب تصفية مختلفة أو تابعنا للاطلاع على الفرص القادمة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities?.map((opp: any) => (
              <div key={opp.id} className="bg-white rounded-2xl border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-bold text-foreground text-lg leading-snug group-hover:text-primary transition-colors">{opp.title}</h3>
                    <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium border ${typeStyles[opp.type] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                      {typeLabels[opp.type] || opp.type}
                    </span>
                  </div>

                  {opp.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-5 leading-loose">{opp.description}</p>
                  )}

                  <div className="space-y-2.5 text-sm text-muted-foreground">
                    {opp.company && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                          <Building className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{opp.company}</span>
                      </div>
                    )}
                    {opp.deadline && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span>آخر موعد: {formatDate(opp.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">نُشر بواسطة {opp.creator_name}</span>
                  <button className="flex items-center gap-1 text-sm text-primary font-semibold group-hover:gap-2 transition-all">
                    عرض التفاصيل <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
