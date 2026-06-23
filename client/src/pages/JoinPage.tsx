import { useState } from 'react';
import { Link } from 'wouter';
import api from '../lib/api';
import { CheckCircle, User, Mail, Phone, MapPin, Briefcase, Building, Clock, Tag, Linkedin, Globe, ChevronDown, Star } from 'lucide-react';
import Toaster from '../components/ui/Toaster';

const experienceOptions = ['أقل من سنة', '1-3 سنوات', '3-5 سنوات', '5-10 سنوات', 'أكثر من 10 سنوات'];
const industries = ['التكنولوجيا', 'التجزئة', 'التجارة الإلكترونية', 'الإعلام والاتصالات', 'الضيافة والسياحة', 'التعليم', 'الصحة', 'العقارات', 'المال والأعمال', 'الحكومة', 'أخرى'];
const sources = ['وسائل التواصل الاجتماعي', 'توصية شخصية', 'محرك البحث', 'فعالية أو مؤتمر', 'أخرى'];

const inputCls = 'w-full border border-input rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        {label}
      </label>
      {children}
    </div>
  );
}

export default function JoinPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', city: '',
    specialization: '', company: '', experience: '',
    industry: '', contribution: '', source: '', linkedin: '',
    agreement: false,
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreement) { setError('يجب الموافقة على الشروط والأحكام'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/membership/apply', form);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a1526] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-md text-center animate-slide-up">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-400/30 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">تم استلام طلبك!</h1>
          <p className="text-white/60 mb-10 leading-loose text-lg">
            شكراً لاهتمامك بالانضمام إلى مجتمع مبادرة تسويقية. سيتم مراجعة طلبك والرد عليك خلال 3-5 أيام عمل.
          </p>
          <Link href="/" className="inline-block bg-secondary text-[#0a1526] px-10 py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all shadow-xl">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Toaster />

      {/* Header */}
      <div className="bg-[#0a1526] text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-secondary/15 text-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star className="w-3.5 h-3.5 fill-secondary" />
            عضوية حصرية
          </div>
          <h1 className="text-5xl font-bold mb-5 leading-tight">طلب العضوية</h1>
          <p className="text-white/60 max-w-xl mx-auto leading-loose text-lg">
            انضم إلى مجتمع يضم نخبة المسوقين والمستشارين ورواد الأعمال في العالم العربي.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-14 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">١</div>
              <h2 className="text-xl font-bold text-foreground">المعلومات الشخصية</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field icon={User} label="الاسم الكامل *">
                <input type="text" required value={form.fullName} onChange={set('fullName')} className={inputCls} placeholder="محمد أحمد" />
              </Field>
              <Field icon={Mail} label="البريد الإلكتروني *">
                <input type="email" required value={form.email} onChange={set('email')} className={inputCls} placeholder="you@example.com" dir="ltr" />
              </Field>
              <Field icon={Phone} label="رقم الجوال *">
                <input type="tel" required value={form.phone} onChange={set('phone')} className={inputCls} placeholder="+966 5X XXX XXXX" dir="ltr" />
              </Field>
              <Field icon={MapPin} label="المدينة *">
                <input type="text" required value={form.city} onChange={set('city')} className={inputCls} placeholder="الرياض، دبي، بيروت..." />
              </Field>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">٢</div>
              <h2 className="text-xl font-bold text-foreground">المعلومات المهنية</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field icon={Briefcase} label="التخصص *">
                <input type="text" required value={form.specialization} onChange={set('specialization')} className={inputCls} placeholder="التسويق الرقمي، استراتيجية العلامة..." />
              </Field>
              <Field icon={Building} label="الشركة / المؤسسة">
                <input type="text" value={form.company} onChange={set('company')} className={inputCls} placeholder="اسم شركتك أو مؤسستك" />
              </Field>
              <Field icon={Clock} label="سنوات الخبرة *">
                <select required value={form.experience} onChange={set('experience')} className={inputCls}>
                  <option value="">اختر مدة الخبرة...</option>
                  {experienceOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field icon={Tag} label="القطاع *">
                <select required value={form.industry} onChange={set('industry')} className={inputCls}>
                  <option value="">اختر قطاعك...</option>
                  {industries.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field icon={Linkedin} label="ملف LinkedIn">
                <input type="url" value={form.linkedin} onChange={set('linkedin')} className={inputCls} placeholder="https://linkedin.com/in/username" dir="ltr" />
              </Field>
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">٣</div>
              <h2 className="text-xl font-bold text-foreground">الدوافع والمساهمة</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">كيف تتوقع المساهمة في المجتمع؟ *</label>
                <textarea
                  required rows={4}
                  value={form.contribution}
                  onChange={set('contribution')}
                  className={inputCls + ' resize-none'}
                  placeholder="أخبرنا كيف يمكنك إثراء المجتمع بخبراتك ومعارفك..."
                />
              </div>
              <Field icon={ChevronDown} label="كيف علمت بالمجتمع؟">
                <select value={form.source} onChange={set('source')} className={inputCls}>
                  <option value="">اختر...</option>
                  {sources.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full border border-red-300 flex items-center justify-center shrink-0 text-xs font-bold">!</span>
              {error}
            </div>
          )}

          {/* Agreement */}
          <div className="flex items-start gap-3 bg-white rounded-2xl border p-5">
            <input
              type="checkbox" id="agreement"
              checked={form.agreement} onChange={set('agreement')}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-primary"
            />
            <label htmlFor="agreement" className="text-sm text-muted-foreground leading-relaxed">
              أوافق على{' '}
              <span className="text-primary cursor-pointer hover:underline font-medium">شروط وأحكام</span>{' '}
              الانضمام لمجتمع مبادرة تسويقية وسياسة الخصوصية. أفهم أن العضوية تخضع للمراجعة والقبول من فريق المجتمع.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="button-submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'إرسال طلب العضوية'
            }
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">سجّل دخولك</Link>
        </p>
      </div>
    </div>
  );
}
