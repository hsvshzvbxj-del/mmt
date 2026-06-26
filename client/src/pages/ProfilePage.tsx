import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../hooks/useToast';
import {
  Camera, Edit3, Save, X, MapPin, Briefcase, Building, Globe,
  Linkedin, Phone, Tag, Clock, CheckCircle, Star, Users, BookOpen,
  BadgeCheck, Palette, ExternalLink
} from 'lucide-react';
import Toaster from '../components/ui/Toaster';

const THEMES = [
  { id: 'blue',   label: 'أزرق ملكي',   from: 'from-[#0a1526]',  to: 'to-[#1e3a5f]',  accent: '#1e3a5f' },
  { id: 'purple', label: 'بنفسجي',       from: 'from-[#1a0a3d]',  to: 'to-[#3b1fa8]',  accent: '#3b1fa8' },
  { id: 'teal',   label: 'أخضر مائي',   from: 'from-[#0a2a2a]',  to: 'to-[#0d5c63]',  accent: '#0d5c63' },
  { id: 'rose',   label: 'وردي',         from: 'from-[#2d0a1a]',  to: 'to-[#8b1a4a]',  accent: '#8b1a4a' },
  { id: 'amber',  label: 'ذهبي',         from: 'from-[#2a1a00]',  to: 'to-[#92600a]',  accent: '#92600a' },
  { id: 'dark',   label: 'أسود أنيق',   from: 'from-[#0a0a0a]',  to: 'to-[#2a2a2a]',  accent: '#2a2a2a' },
];

const experienceOptions = ['أقل من سنة','1-3 سنوات','3-5 سنوات','5-10 سنوات','أكثر من 10 سنوات'];
const industries = ['التكنولوجيا','التجزئة','التجارة الإلكترونية','الإعلام والاتصالات','الضيافة والسياحة','التعليم','الصحة','العقارات','المال والأعمال','الحكومة','أخرى'];

function getInitials(name?: string) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function resizeImage(file: File, maxW = 400, maxH = 400, quality = 0.85): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxW) { height = (height * maxW) / width; width = maxW; }
        if (height > maxH) { width = (width * maxH) / height; height = maxH; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function resizeCover(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const W = 1200, H = 350;
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d')!;
        // Cover fill
        const scale = Math.max(W / img.width, H / img.height);
        const sw = img.width * scale, sh = img.height * scale;
        ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { user: authUser, setUser } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef  = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/auth/me').then(r => r.data),
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      name: '', phone: '', city: '', specialization: '', experience: '',
      industry: '', company: '', linkedin: '', bio: '', website: '', skills: '',
    },
  });

  useEffect(() => {
    if (profile) reset({
      name: profile.name || '', phone: profile.phone || '', city: profile.city || '',
      specialization: profile.specialization || '', experience: profile.experience || '',
      industry: profile.industry || '', company: profile.company || '',
      linkedin: profile.linkedin || '', bio: profile.bio || '',
      website: profile.website || '', skills: (profile.skills || []).join(', '),
    });
  }, [profile, reset]);

  const update = useMutation({
    mutationFn: (data: any) => {
      const skills = data.skills ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      return api.put('/auth/me', { ...data, skills });
    },
    onSuccess: (res) => {
      setUser({ id: res.data.id || res.data._id, name: res.data.name, email: res.data.email, role: res.data.role });
      qc.invalidateQueries({ queryKey: ['my-profile'] });
      toast('تم تحديث الملف الشخصي ✓', 'success');
      setEditing(false);
    },
    onError: () => toast('حدث خطأ أثناء التحديث', 'error'),
  });

  const uploadAvatar = useMutation({
    mutationFn: (image: string) => api.post('/upload/avatar', { image }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-profile'] }); toast('تم تحديث الصورة ✓', 'success'); },
    onError: () => toast('فشل رفع الصورة — تأكد أنها أقل من 2MB', 'error'),
  });

  const uploadCover = useMutation({
    mutationFn: (image: string) => api.post('/upload/cover', { image }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-profile'] }); toast('تم تحديث الغلاف ✓', 'success'); },
    onError: () => toast('فشل رفع صورة الغلاف', 'error'),
  });

  const setTheme = useMutation({
    mutationFn: (profileTheme: string) => api.put('/auth/me', { profileTheme }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-profile'] }),
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('الصورة كبيرة جداً (الحد 5MB)', 'error'); return; }
    const resized = await resizeImage(file);
    uploadAvatar.mutate(resized);
    e.target.value = '';
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast('الصورة كبيرة جداً (الحد 8MB)', 'error'); return; }
    const resized = await resizeCover(file);
    uploadCover.mutate(resized);
    e.target.value = '';
  };

  const theme = THEMES.find(t => t.id === profile?.profileTheme) || THEMES[0];
  const skills: string[] = profile?.skills || [];

  const roleLabel = profile?.role === 'admin' ? 'مدير المنصة' : profile?.role === 'moderator' ? 'مشرف' : 'عضو';
  const roleBg    = profile?.role === 'admin' ? 'bg-red-100 text-red-700' : profile?.role === 'moderator' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700';

  if (isLoading) return (
    <div className="max-w-4xl mx-auto animate-pulse p-4">
      <div className="h-48 bg-gray-200 rounded-2xl mb-4" />
      <div className="h-24 bg-gray-100 rounded-xl" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-fade-in" dir="rtl">
      <Toaster />

      {/* ── Cover ── */}
      <div className="relative h-52 md:h-64 rounded-b-3xl overflow-hidden group">
        {profile?.coverUrl
          ? <img src={profile.coverUrl} alt="غلاف" className="w-full h-full object-cover" />
          : <div className={`w-full h-full bg-gradient-to-br ${theme.from} ${theme.to}`}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>
        }

        {/* Cover upload button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <button onClick={() => coverInputRef.current?.click()}
            disabled={uploadCover.isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm hover:bg-black/80">
            <Camera className="w-4 h-4" />
            {uploadCover.isPending ? 'جارٍ الرفع...' : 'تغيير الغلاف'}
          </button>
        </div>

        {/* Theme picker */}
        <button onClick={() => setShowThemePicker(s => !s)}
          className="absolute top-3 left-3 bg-black/40 text-white backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 hover:bg-black/60 transition-colors">
          <Palette className="w-3.5 h-3.5" /> تخصيص الألوان
        </button>
        {showThemePicker && (
          <div className="absolute top-12 left-3 bg-white rounded-xl shadow-2xl p-3 z-50 flex flex-wrap gap-2 w-52">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => { setTheme.mutate(t.id); setShowThemePicker(false); }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium w-full hover:bg-gray-50 transition-colors ${profile?.profileTheme === t.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${t.from} ${t.to} shrink-0`} />
                {t.label}
                {profile?.profileTheme === t.id && <CheckCircle className="w-3.5 h-3.5 text-primary mr-auto" />}
              </button>
            ))}
          </div>
        )}

        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      {/* ── Profile header ── */}
      <div className="px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 md:-mt-20 mb-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-primary to-[#2a4a7f]">
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                    {getInitials(profile?.name)}
                  </div>
              }
            </div>
            <button onClick={() => avatarInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            {uploadAvatar.isPending && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Name & role */}
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile?.name}</h1>
              <BadgeCheck className="w-6 h-6 text-primary" />
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleBg}`}>{roleLabel}</span>
            </div>
            {profile?.specialization && (
              <p className="text-muted-foreground font-medium mb-1">{profile.specialization}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {profile?.company && (
                <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{profile.company}</span>
              )}
              {profile?.city && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.city}</span>
              )}
              {profile?.experience && (
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{profile.experience}</span>
              )}
            </div>
          </div>

          {/* Edit button */}
          <div className="flex gap-2 shrink-0">
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                <Edit3 className="w-4 h-4" /> تعديل الملف
              </button>
            ) : (
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" /> إلغاء
              </button>
            )}
          </div>
        </div>

        {/* ── Edit Form ── */}
        {editing && (
          <div className="bg-white rounded-2xl border shadow-sm mb-6 overflow-hidden">
            <div className="bg-primary/5 border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" /> تعديل المعلومات
              </h2>
            </div>
            <form onSubmit={handleSubmit(d => update.mutate(d))} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field icon={<Star className="w-3.5 h-3.5" />} label="الاسم الكامل">
                  <input {...register('name', { required: true })} className={iCls} placeholder="اسمك الكامل" />
                </Field>
                <Field icon={<Phone className="w-3.5 h-3.5" />} label="رقم الجوال">
                  <input {...register('phone')} className={iCls} placeholder="+966 5X XXX XXXX" dir="ltr" />
                </Field>
                <Field icon={<MapPin className="w-3.5 h-3.5" />} label="المدينة">
                  <input {...register('city')} className={iCls} placeholder="الرياض، دبي، القاهرة..." />
                </Field>
                <Field icon={<Briefcase className="w-3.5 h-3.5" />} label="التخصص">
                  <input {...register('specialization')} className={iCls} placeholder="مدير تسويق، استراتيجي علامات..." />
                </Field>
                <Field icon={<Clock className="w-3.5 h-3.5" />} label="سنوات الخبرة">
                  <select {...register('experience')} className={iCls}>
                    <option value="">اختر...</option>
                    {experienceOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field icon={<Tag className="w-3.5 h-3.5" />} label="القطاع">
                  <select {...register('industry')} className={iCls}>
                    <option value="">اختر...</option>
                    {industries.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field icon={<Building className="w-3.5 h-3.5" />} label="الشركة / الجهة">
                  <input {...register('company')} className={iCls} placeholder="اسم الشركة" />
                </Field>
                <Field icon={<Linkedin className="w-3.5 h-3.5" />} label="LinkedIn">
                  <input {...register('linkedin')} type="url" className={iCls} placeholder="https://linkedin.com/in/username" dir="ltr" />
                </Field>
              </div>
              <Field icon={<Globe className="w-3.5 h-3.5" />} label="الموقع الشخصي">
                <input {...register('website')} type="url" className={iCls} placeholder="https://yourwebsite.com" dir="ltr" />
              </Field>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">نبذة تعريفية</label>
                <textarea {...register('bio')} rows={4} className={iCls + ' resize-none'}
                  placeholder="أخبر الأعضاء عن نفسك، تجربتك، واهتماماتك المهنية..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">المهارات (مفصولة بفاصلة)</label>
                <input {...register('skills')} className={iCls}
                  placeholder="التسويق الرقمي، SEO، تحليل البيانات، إدارة العلامات التجارية" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={update.isPending || !isDirty}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-60 shadow-md">
                  <Save className="w-4 h-4" />
                  {update.isPending ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  className="px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Bio */}
            {profile?.bio && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> نبذة تعريفية
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> المهارات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span key={i} className="bg-primary/8 text-primary border border-primary/20 text-sm px-3 py-1.5 rounded-full font-medium hover:bg-primary/15 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social links */}
            {(profile?.linkedin || profile?.website) && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> روابط التواصل
                </h3>
                <div className="space-y-3">
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-800 group">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Linkedin className="w-4 h-4 text-blue-700" />
                      </div>
                      <span className="flex-1 truncate">{profile.linkedin}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-primary hover:text-primary/80 group">
                      <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <Globe className="w-4 h-4 text-primary" />
                      </div>
                      <span className="flex-1 truncate">{profile.website}</span>
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
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide text-muted-foreground">معلومات الحساب</h3>
              <div className="space-y-3">
                <InfoRow icon={<Briefcase className="w-4 h-4" />} label="التخصص" value={profile?.specialization} />
                <InfoRow icon={<Building className="w-4 h-4" />} label="الشركة" value={profile?.company} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="المدينة" value={profile?.city} />
                <InfoRow icon={<Clock className="w-4 h-4" />} label="الخبرة" value={profile?.experience} />
                <InfoRow icon={<Tag className="w-4 h-4" />} label="القطاع" value={profile?.industry} />
                {profile?.phone && (
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="الجوال" value={profile.phone} />
                )}
              </div>
            </div>

            {/* Member since */}
            <div className={`rounded-2xl bg-gradient-to-br ${theme.from} ${theme.to} p-5 text-white shadow-sm`}>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-white/70" />
                <span className="text-xs text-white/70 font-medium">عضو منذ</span>
              </div>
              <div className="text-lg font-bold">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
                  : '—'}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span className="text-xs text-white/80">عضو موثّق</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const iCls = 'w-full border border-input rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1.5 text-muted-foreground">
        {icon}{label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center text-primary shrink-0">{icon}</div>
      <div>
        <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
        <div className="text-foreground font-medium text-xs">{value}</div>
      </div>
    </div>
  );
}
