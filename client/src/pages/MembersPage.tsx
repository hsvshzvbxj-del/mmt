import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import api from '../lib/api';
import { Search, MapPin, Briefcase, Building, Users } from 'lucide-react';
import { getInitials } from '../lib/utils';

const avatarColors = [
  'from-blue-500 to-blue-600',
  'from-violet-500 to-violet-600',
  'from-emerald-500 to-emerald-600',
  'from-orange-500 to-orange-600',
  'from-rose-500 to-rose-600',
  'from-teal-500 to-teal-600',
  'from-indigo-500 to-indigo-600',
  'from-pink-500 to-pink-600',
];

export default function MembersPage() {
  const [filters, setFilters] = useState({ name: '', city: '', industry: '', specialization: '' });
  const [applied, setApplied] = useState({ name: '', city: '', industry: '', specialization: '' });

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', applied],
    queryFn: () => api.get('/members', { params: applied }).then(r => r.data),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilters(p => ({ ...p, [k]: e.target.value }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(filters);
  };

  const clearFilters = () => {
    const empty = { name: '', city: '', industry: '', specialization: '' };
    setFilters(empty);
    setApplied(empty);
  };

  const hasFilters = Object.values(applied).some(Boolean);

  return (
    <div className="animate-fade-in">
      <section className="bg-[#0a1526] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-secondary/15 text-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">الأعضاء</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">دليل الأعضاء</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-loose">تعرّف على أعضاء مجتمع مبادرة تسويقية وتواصل مع نخبة المسوقين في العالم العربي</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border p-6 mb-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {[
              { key: 'name', placeholder: 'البحث بالاسم', icon: Search },
              { key: 'city', placeholder: 'المدينة', icon: MapPin },
              { key: 'industry', placeholder: 'القطاع', icon: Briefcase },
              { key: 'specialization', placeholder: 'التخصص', icon: Building },
            ].map(({ key, placeholder, icon: Icon }) => (
              <div key={key} className="relative">
                <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={(filters as any)[key]}
                  onChange={set(key)}
                  className="w-full border border-input rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              بحث
            </button>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="border px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-muted-foreground">
                مسح الفلاتر
              </button>
            )}
            {members && (
              <span className="text-sm text-muted-foreground mr-auto">{members.length} عضو</span>
            )}
          </div>
        </form>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4" />
                <div className="h-4 bg-gray-100 rounded-lg mb-2 mx-auto w-3/4" />
                <div className="h-3 bg-gray-50 rounded-lg mx-auto w-1/2" />
              </div>
            ))}
          </div>
        ) : members?.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground text-sm mb-4">جرّب تعديل معايير البحث</p>
            <button onClick={clearFilters} className="text-primary font-medium hover:underline text-sm">مسح الفلاتر</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {members?.map((member: any, i: number) => (
              <Link key={member.id} href={`/members/${member.id}`}>
                <div className="bg-white rounded-2xl border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-6 group cursor-pointer">
                  <div className="text-center mb-5">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-18 h-18 rounded-2xl mx-auto object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all" style={{width: 72, height: 72}} />
                    ) : (
                      <div className={`w-18 h-18 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} group-hover:scale-105 transition-transform shadow-md`} style={{width: 72, height: 72}}>
                        {getInitials(member.name)}
                      </div>
                    )}
                    <h3 className="font-bold text-foreground mt-4 mb-1 group-hover:text-primary transition-colors leading-snug">{member.name}</h3>
                    {member.specialization && (
                      <p className="text-xs text-muted-foreground">{member.specialization}</p>
                    )}
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {member.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 shrink-0 text-primary/50" />
                        <span className="truncate">{member.company}</span>
                      </div>
                    )}
                    {member.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/50" />
                        <span>{member.city}</span>
                      </div>
                    )}
                    {member.experience && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 shrink-0 text-primary/50" />
                        <span>{member.experience}</span>
                      </div>
                    )}
                  </div>
                  {member.industry && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-xs bg-primary/8 text-primary px-3 py-1 rounded-full font-medium">{member.industry}</span>
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
