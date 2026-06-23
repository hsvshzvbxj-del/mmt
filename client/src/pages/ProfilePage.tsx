import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../hooks/useToast';
import { User, Mail, Phone, MapPin, Briefcase, Building, Clock, Tag, Linkedin, Globe, Save } from 'lucide-react';
import { getInitials } from '../lib/utils';
import Toaster from '../components/ui/Toaster';

const experienceOptions = ['أقل من سنة', '1-3 سنوات', '3-5 سنوات', '5-10 سنوات', 'أكثر من 10 سنوات'];
const industries = ['التكنولوجيا', 'التجزئة', 'التجارة الإلكترونية', 'الإعلام والاتصالات', 'الضيافة والسياحة', 'التعليم', 'الصحة', 'العقارات', 'المال والأعمال', 'الحكومة', 'أخرى'];

export default function ProfilePage() {
  const { user: authUser, setUser } = useAuth();

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
    if (profile) {
      reset({
        name: profile.name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        specialization: profile.specialization || '',
        experience: profile.experience || '',
        industry: profile.industry || '',
        company: profile.company || '',
        linkedin: profile.linkedin || '',
        bio: profile.bio || '',
        website: profile.website || '',
        skills: (profile.skills || []).join(', '),
      });
    }
  }, [profile, reset]);

  const update = useMutation({
    mutationFn: (data: any) => {
      const skills = data.skills ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      return api.put('/auth/me', { ...data, skills });
    },
    onSuccess: (res) => {
      setUser({ id: res.data.id, name: res.data.name, email: res.data.email, role: res.data.role });
      toast('تم تحديث الملف الشخصي بنجاح!', 'success');
      reset({
        ...res.data,
        skills: (res.data.skills || []).join(', '),
      });
    },
    onError: () => toast('حدث خطأ أثناء التحديث', 'error'),
  });

  if (isLoading) return (
    <div className="container mx-auto px-4 py-16 max-w-2xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-1/2" />
      <div className="bg-white rounded-2xl border p-8 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl animate-fade-in">
      <Toaster />
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border p-8 mb-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl">
            {getInitials(profile?.name || authUser?.name || 'U')}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile?.name}</h1>
            <p className="text-muted-foreground">{profile?.email}</p>
            <span className={`text-xs px-2.5 py-1 rounded-full mt-2 inline-block font-medium ${
              profile?.role === 'admin' ? 'bg-red-100 text-red-700' :
              profile?.role === 'moderator' ? 'bg-orange-100 text-orange-700' :
              'bg-green-100 text-green-700'
            }`}>
              {profile?.role === 'admin' ? 'مدير' : profile?.role === 'moderator' ? 'مشرف' : 'عضو'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-foreground">تعديل الملف الشخصي</h2>
        </div>
        <form onSubmit={handleSubmit(d => update.mutate(d))} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field icon={User} label="الاسم الكامل">
              <input {...register('name', { required: true })} className={inputCls} />
            </Field>
            <Field icon={Phone} label="رقم الجوال">
              <input {...register('phone')} className={inputCls} />
            </Field>
            <Field icon={MapPin} label="المدينة">
              <input {...register('city')} className={inputCls} />
            </Field>
            <Field icon={Briefcase} label="التخصص">
              <input {...register('specialization')} className={inputCls} />
            </Field>
            <Field icon={Clock} label="سنوات الخبرة">
              <select {...register('experience')} className={inputCls}>
                <option value="">اختر...</option>
                {experienceOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field icon={Tag} label="القطاع">
              <select {...register('industry')} className={inputCls}>
                <option value="">اختر...</option>
                {industries.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field icon={Building} label="الشركة">
              <input {...register('company')} className={inputCls} />
            </Field>
            <Field icon={Linkedin} label="LinkedIn">
              <input {...register('linkedin')} type="url" className={inputCls} placeholder="https://linkedin.com/in/..." />
            </Field>
          </div>
          <Field icon={Globe} label="الموقع الشخصي">
            <input {...register('website')} type="url" className={inputCls} placeholder="https://yoursite.com" />
          </Field>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">نبذة تعريفية</label>
            <textarea {...register('bio')} rows={3} className={inputCls + ' resize-none'} placeholder="اكتب نبذة مختصرة عنك..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">المهارات (مفصولة بفاصلة)</label>
            <input {...register('skills')} className={inputCls} placeholder="التسويق الرقمي، SEO، تحليل البيانات" />
          </div>
          <button type="submit" disabled={update.isPending || !isDirty}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" />
            {update.isPending ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls = 'w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';
function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />{label}
      </label>
      {children}
    </div>
  );
}
