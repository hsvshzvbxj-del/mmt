import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Briefcase, Building, Calendar, Filter } from 'lucide-react';
import { getTypeColor, formatDate } from '../lib/utils';

const types = ['', 'job', 'project', 'consulting', 'partnership'];
const typeLabels: Record<string, string> = { '': 'الجميع', job: 'وظيفة', project: 'مشروع', consulting: 'استشارة', partnership: 'شراكة' };

export default function OpportunitiesPage() {
  const [typeFilter, setTypeFilter] = useState('');

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities', typeFilter],
    queryFn: () => api.get('/opportunities', { params: typeFilter ? { type: typeFilter } : {} }).then(r => r.data),
  });

  return (
    <div className="animate-fade-in">
      <section className="bg-[#0a1526] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">الفرص</h1>
          <p className="text-white/70">استكشف أفضل الفرص الوظيفية والاستشارية والمشاريع</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${typeFilter === t ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-white border hover:border-primary/50 text-foreground'}`}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded mb-3 w-3/4" />
                <div className="h-4 bg-gray-100 rounded mb-2 w-1/2" />
              </div>
            ))}
          </div>
        ) : opportunities?.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد فرص متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities?.map((opp: any) => (
              <div key={opp.id} className="bg-white rounded-xl border hover:shadow-md transition-all hover:-translate-y-0.5 p-6 group">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="font-bold text-foreground text-lg leading-snug group-hover:text-primary transition-colors">{opp.title}</h3>
                  <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${getTypeColor(opp.type)}`}>
                    {typeLabels[opp.type] || opp.type}
                  </span>
                </div>

                {opp.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{opp.description}</p>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  {opp.company && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 shrink-0 text-primary" />
                      <span>{opp.company}</span>
                    </div>
                  )}
                  {opp.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0 text-primary" />
                      <span>آخر موعد: {formatDate(opp.deadline)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">بواسطة {opp.creator_name}</span>
                  <button className="text-sm text-primary font-medium hover:underline">
                    عرض التفاصيل
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
