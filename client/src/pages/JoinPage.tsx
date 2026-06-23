import { useState } from 'react';
import { Link } from 'wouter';
import api from '../lib/api';
import { CheckCircle, User, Mail, Phone, MapPin, Briefcase, Building, Clock, Tag, Linkedin, Globe, ChevronDown } from 'lucide-react';
import Toaster from '../components/ui/Toaster';

const experienceOptions = ['أقل من سنة', '1-3 سنوات', '3-5 سنوات', '5-10 سنوات', 'أكثر من 10 سنوات'];
const industries = ['التكنولوجيا', 'التجزئة', 'التجارة الإلكترونية', 'الإعلام والاتصالات', 'الضيافة والسياحة', 'التعليم', 'الصحة', 'العقارات', 'المال والأعمال', 'الحكومة', 'أخرى'];
const sources = ['وسائل التواصل الاجتماعي', 'توصية شخصية', 'محرك البحث', 'فعالية أو مؤتمر', 'أخرى'];

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center animate-slide-up">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">تم استلام طلبك</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            شكراً لاهتمامك بالانضمام إلى مجتمع مبادرة تسويقية. سيتم مراجعة طلبك والرد عليك خلال 3-5 أيام عمل.
          </p>
          <Link href="/" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
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
      <div className="bg-[#0a1526] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">طلب عضوية</h1>
          <p className="text-white/70 max-w-xl mx-auto leading-relaxed">
            انضم إلى مجتمع يضم نخبة المسوقين والمستشارين ورواد الأعمال في العالم العربي.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-foreground border-b pb-4">المعلومات الشخصية</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field icon={User} label="الاسم الكامل *" required>
              <input type="text" required value={form.fullName} onChange={set('fullName')} className={inputCls} placeholder="محمد أحمد" />
            </Field>
            <Field icon={Mail} label="البريد الإلكتروني *" required>
              <input type="email" required value={form.email} onChange={set('email')} className={inputCls} placeholder="you@example.com" />
            </Field>
            <Field icon={Phone} label="رقم الجوال *" required>
              <input type="tel" required value={form.phone} onChange={set('phone')} className={inputCls} placeholder="+966 5X XXX XXXX" />
            </Field>
            <Field icon={MapPin} label="المدينة *" required>
              <input type="text" required value={form.city} onChange={set('city')} className={inputCls} placeholder="الرياض، دبي..." />
            </Field>
          </div>

          <h2 className="text-xl font-bold text-foreground border-b pb-4 pt-2">المعلومات المهنية</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field icon={Briefcase} label="التخصص *" required>
              <input type="text" required value={form.specialization} onChange={set('specialization')} className={inputCls} placeholder="التسويق الرقمي، استراتيجية العلامة..." />
            </Field>
            <Field icon={Building} label="الشركة / المؤسسة">
              <input type="text" value={form.company} onChange={set('company')} className={inputCls} placeholder="اسم شركتك" />
            </Field>
            <Field icon={Clock} label="سنوات الخبرة *" required>
              <select required value={form.experience} onChange={set('experience')} className={inputCls}>
                <option value="">اختر...</option>
                {experienceOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field icon={Tag} label="القطاع *" required>
              <select required value={form.industry} onChange={set('industry')} className={inputCls}>
                <option value="">اختر القطاع...</option>
                {industries.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>

          <Field icon={Globe} label="ملف LinkedIn">
            <input type="url" value={form.linkedin} onChange={set('linkedin')} className={inputCls} placeholder="https://linkedin.com/in/username" />
          </Field>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">توقعك من المساهمة في المجتمع *</label>
            <textarea
              required
              rows={3}
              value={form.contribution}
              onChange={set('contribution')}
              className={inputCls + ' resize-none'}
              placeholder="كيف تتوقع أن تساهم وتستفيد من المجتمع؟"
            />
          </div>

          <Field icon={ChevronDown} label="كيف علمت بالمجتمع؟">
            <select value={form.source} onChange={set('source')} className={inputCls}>
              <option value="">اختر...</option>
              {sources.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex items-start gap-3">
            <input type="checkbox" id="agreement" checked={form.agreement} onChange={set('agreement')} className="mt-1 h-4 w-4 rounded border-gray-300 accent-primary" />
            <label htmlFor="agreement" className="text-sm text-muted-foreground leading-relaxed">
              أوافق على <span className="text-primary cursor-pointer hover:underline">شروط وأحكام</span> الانضمام لمجتمع مبادرة تسويقية وسياسة الخصوصية.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="button-submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'إرسال طلب العضوية'}
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

const inputCls = 'w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

function Field({ icon: Icon, label, children, required }: { icon: any; label: string; children: React.ReactNode; required?: boolean }) {
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
