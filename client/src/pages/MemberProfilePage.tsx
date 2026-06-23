import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import api from '../lib/api';
import { MapPin, Briefcase, Building, ExternalLink, Linkedin, Globe, ArrowRight, Clock } from 'lucide-react';
import { getInitials, formatDate } from '../lib/utils';

export default function MemberProfilePage() {
  const { id } = useParams();
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['member', id],
    queryFn: () => api.get(`/members/${id}`).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="container mx-auto px-4 py-16 max-w-3xl animate-pulse">
      <div className="bg-white rounded-2xl border p-8">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="h-6 bg-gray-200 rounded mb-2 mx-auto w-48" />
        <div className="h-4 bg-gray-100 rounded mx-auto w-32" />
      </div>
    </div>
  );

  if (error || !member) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground mb-4">لم يتم العثور على العضو</p>
      <Link href="/members" className="text-primary hover:underline">العودة لدليل الأعضاء</Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl animate-fade-in">
      <Link href="/members" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowRight className="w-4 h-4" /> العودة لدليل الأعضاء
      </Link>

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-br from-primary to-[#2a4a7f]" />
        <div className="px-8 pb-8">
          <div className="-mt-16 mb-6 flex items-end gap-6">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-primary flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {getInitials(member.name)}
            </div>
            <div className="mb-3">
              <h1 className="text-2xl font-bold text-foreground">{member.name}</h1>
              {member.specialization && <p className="text-muted-foreground">{member.specialization}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: MapPin, value: member.city, label: 'المدينة' },
              { icon: Building, value: member.company, label: 'الشركة' },
              { icon: Clock, value: member.experience, label: 'الخبرة' },
              { icon: Briefcase, value: member.industry, label: 'القطاع' },
            ].filter(({ value }) => value).map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-muted/30 rounded-lg p-3">
                <Icon className="w-4 h-4 text-primary mb-1" />
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-sm font-medium text-foreground">{value}</div>
              </div>
            ))}
          </div>

          {member.bio && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-foreground mb-3">نبذة تعريفية</h2>
              <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
            </div>
          )}

          {member.skills?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-foreground mb-3">المهارات</h2>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill: string) => (
                  <span key={skill} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">{skill}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-6 border-t">
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors">
                <Linkedin className="w-4 h-4" /> LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {member.website && (
              <a href={member.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors">
                <Globe className="w-4 h-4" /> الموقع <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">عضو منذ {formatDate(member.created_at)}</p>
        </div>
      </div>
    </div>
  );
}
