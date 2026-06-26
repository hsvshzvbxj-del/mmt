import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import api from '../lib/api';
import {
  MapPin, Briefcase, Building, ExternalLink, Linkedin,
  Globe, ArrowRight, Clock, Tag, BadgeCheck, Star, CheckCircle
} from 'lucide-react';
import { formatDate } from '../lib/utils';

function getInitials(name?: string) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const THEMES: Record<string, { from: string; to: string }> = {
  blue:   { from: 'from-[#0a1526]', to: 'to-[#1e3a5f]' },
  purple: { from: 'from-[#1a0a3d]', to: 'to-[#3b1fa8]' },
  teal:   { from: 'from-[#0a2a2a]', to: 'to-[#0d5c63]' },
  rose:   { from: 'from-[#2d0a1a]', to: 'to-[#8b1a4a]' },
  amber:  { from: 'from-[#2a1a00]', to: 'to-[#92600a]' },
  dark:   { from: 'from-[#0a0a0a]', to: 'to-[#2a2a2a]' },
};

export default function MemberProfilePage() {
  const { id } = useParams();
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['member', id],
    queryFn: () => api.get(`/members/${id}`).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-52 bg-gray-200 rounded-2xl mb-4" />
      <div className="bg-white rounded-2xl border p-8 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  );

  if (error || !member) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground mb-4">لم يتم العثور على العضو</p>
      <Link href="/members" className="text-primary hover:underline">العودة لدليل الأعضاء</Link>
    </div>
  );

  const theme = THEMES[member.profileTheme] || THEMES.blue;
  const roleLabel = member.role === 'admin' ? 'مدير المنصة' : member.role === 'moderator' ? 'مشرف' : 'عضو';
  const roleBg    = member.role === 'admin' ? 'bg-red-100 text-red-700' : member.role === 'moderator' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700';
  const skills: string[] = member.skills || [];

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-fade-in" dir="rtl">
      <div className="px-4 pt-6 mb-4">
        <Link href="/members" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowRight className="w-4 h-4" /> العودة لدليل الأعضاء
        </Link>
      </div>

      {/* ── Cover ── */}
      <div className="relative h-52 md:h-64 rounded-b-3xl overflow-hidden mx-0">
        {member.coverUrl
          ? <img src={member.coverUrl} alt="غلاف" className="w-full h-full object-cover" />
          : <div className={`w-full h-full bg-gradient-to-br ${theme.from} ${theme.to}`}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>
        }
      </div>

      <div className="px-4 md:px-8">
        {/* ── Profile header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 md:-mt-20 mb-6">
          {/* Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-primary to-[#2a4a7f] shrink-0">
            {member.avatarUrl
              ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                  {getInitials(member.name)}
                </div>
            }
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{member.name}</h1>
              <BadgeCheck className="w-6 h-6 text-primary" />
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleBg}`}>{roleLabel}</span>
            </div>
            {member.specialization && (
              <p className="text-muted-foreground font-medium mb-2">{member.specialization}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {member.company  && <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{member.company}</span>}
              {member.city     && <span className="flex items-center gap-1"><MapPin   className="w-3.5 h-3.5" />{member.city}</span>}
              {member.experience && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{member.experience}</span>}
            </div>
          </div>

          {/* Social links quick access */}
          <div className="flex gap-2 shrink-0 pb-2">
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors shadow-sm">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {member.website && (
              <a href={member.website} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/8 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/15 transition-colors shadow-sm">
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Bio */}
            {member.bio && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> نبذة تعريفية
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">{member.bio}</p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> المهارات والتخصصات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span key={i} className="bg-primary/8 text-primary border border-primary/20 text-sm px-3 py-1.5 rounded-full font-medium hover:bg-primary/15 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(member.linkedin || member.website) && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> روابط التواصل
                </h3>
                <div className="space-y-3">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-800 group">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Linkedin className="w-4 h-4 text-blue-700" />
                      </div>
                      <span className="flex-1 truncate">{member.linkedin}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </a>
                  )}
                  {member.website && (
                    <a href={member.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-primary hover:text-primary/80 group">
                      <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <Globe className="w-4 h-4 text-primary" />
                      </div>
                      <span className="flex-1 truncate">{member.website}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Info card */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">معلومات العضو</h3>
              <div className="space-y-3">
                {member.specialization && <InfoRow icon={<Briefcase />} label="التخصص" value={member.specialization} />}
                {member.company        && <InfoRow icon={<Building   />} label="الشركة"  value={member.company} />}
                {member.city           && <InfoRow icon={<MapPin     />} label="المدينة" value={member.city} />}
                {member.experience     && <InfoRow icon={<Clock      />} label="الخبرة"  value={member.experience} />}
                {member.industry       && <InfoRow icon={<Tag        />} label="القطاع"  value={member.industry} />}
              </div>
            </div>

            {/* Member since card */}
            <div className={`rounded-2xl bg-gradient-to-br ${theme.from} ${theme.to} p-5 text-white shadow-sm`}>
              <div className="text-xs text-white/60 font-medium mb-2">عضو منذ</div>
              <div className="text-lg font-bold">
                {member.createdAt
                  ? new Date(member.createdAt).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
                  : member.created_at ? formatDate(member.created_at) : '—'}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span className="text-xs text-white/80">عضو موثّق في مجتمع MIC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center text-primary shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">
        {icon}
      </div>
      <div>
        <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
        <div className="text-foreground font-medium text-xs">{value}</div>
      </div>
    </div>
  );
}
