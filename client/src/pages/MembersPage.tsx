import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import api from '../lib/api';
import { Search, MapPin, Briefcase, Building } from 'lucide-react';
import { getInitials } from '../lib/utils';

export default function MembersPage() {
  const [filters, setFilters] = useState({ name: '', city: '', industry: '', specialization: '' });
  const [applied, setApplied] = useState({ name: '', city: '', industry: '', specialization: '' });

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', applied],
    queryFn: () => api.get('/members', { params: applied }).then(r => r.data),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setFilters(p => ({ ...p, [k]: e.target.value }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(filters);
  };

  const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

  return (
    <div className="animate-fade-in">
      <section className="bg-[#0a1526] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">دليل الأعضاء</h1>
          <p className="text-white/70">تعرف على أعضاء مجتمع مبادرة تسويقية وتواصل معهم</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <form onSubmit={handleSearch} className="bg-white rounded-xl border p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { key: 'name', placeholder: 'البحث بالاسم', icon: Search },
              { key: 'city', placeholder: 'المدينة', icon: MapPin },
              { key: 'industry', placeholder: 'القطاع', icon: Briefcase },
              { key: 'specialization', placeholder: 'التخصص', icon: Building },
            ].map(({ key, placeholder, icon: Icon }) => (
              <div key={key} className="relative">
                <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={(filters as any)[key]}
                  onChange={set(key)}
                  className="w-full border border-input rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              بحث
            </button>
            <button type="button" onClick={() => { setFilters({ name: '', city: '', industry: '', specialization: '' }); setApplied({ name: '', city: '', industry: '', specialization: '' }); }}
              className="border px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              مسح
            </button>
          </div>
        </form>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2 mx-auto w-3/4" />
                <div className="h-3 bg-gray-100 rounded mx-auto w-1/2" />
              </div>
            ))}
          </div>
        ) : members?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">لا توجد نتائج</p>
            <p className="text-sm mt-1">جرب تعديل معايير البحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members?.map((member: any, i: number) => (
              <Link key={member.id} href={`/members/${member.id}`}>
                <div className="bg-white rounded-xl border hover:shadow-md transition-all hover:-translate-y-1 p-6 group cursor-pointer">
                  <div className="text-center mb-4">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-16 h-16 rounded-full mx-auto object-cover" />
                    ) : (
                      <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl ${avatarColors[i % avatarColors.length]}`}>
                        {getInitials(member.name)}
                      </div>
                    )}
                    <h3 className="font-bold text-foreground mt-3 mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                    {member.specialization && <p className="text-sm text-muted-foreground">{member.specialization}</p>}
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {member.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{member.company}</span>
                      </div>
                    )}
                    {member.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{member.city}</span>
                      </div>
                    )}
                    {member.experience && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 shrink-0" />
                        <span>{member.experience}</span>
                      </div>
                    )}
                  </div>
                  {member.industry && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">{member.industry}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
