import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';

const INTERESTS = [
  'التسويق الرقمي', 'تسويق المحتوى', 'وسائل التواصل الاجتماعي', 'تحسين محركات البحث',
  'التسويق عبر البريد الإلكتروني', 'الإعلانات المدفوعة', 'تحليل البيانات', 'العلامة التجارية',
  'تجربة المستخدم', 'التسويق عبر المؤثرين', 'التجارة الإلكترونية', 'استراتيجية التسويق',
  'التسويق بالمحتوى المرئي', 'بناء المجتمعات', 'الذكاء الاصطناعي في التسويق',
];

const COUNTRIES = [
  'المملكة العربية السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عُمان',
  'مصر', 'الأردن', 'لبنان', 'العراق', 'المغرب', 'تونس', 'الجزائر', 'ليبيا', 'اليمن', 'السودان',
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);

  const totalSteps = 5;

  async function saveStep(newStep: number, data?: any) {
    try {
      await api.put('/auth/me/onboarding', { step: newStep, ...data });
    } catch {}
  }

  function goNext() {
    const next = step + 1;
    setStep(next);
    saveStep(next);
  }

  function toggleInterest(interest: string) {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  }

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await api.put('/auth/me/onboarding', {
        completed: true,
        step: totalSteps,
        interests: selectedInterests,
        country,
      });
      if (user) setUser({ ...user, ...res.data });
      onComplete();
    } catch {
      setLoading(false);
    }
  }

  const steps = [
    /* Step 0 — Welcome */
    <div key="welcome" className="flex flex-col items-center text-center gap-6 py-6">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-2">
        <img src="/logo.png" alt="logo" className="w-16 h-16 object-contain" />
      </div>
      <h1 className="text-3xl font-bold text-primary">أهلاً بك في مجتمع مبادرة تسويقية!</h1>
      <p className="text-gray-500 max-w-sm leading-relaxed">
        نحن سعداء بانضمامك. دعنا نأخذ دقيقتين لنعرّفك على المجتمع ونخصّص تجربتك.
      </p>
      <button onClick={goNext} className="btn-primary w-full max-w-xs py-3 text-lg">
        لنبدأ 🚀
      </button>
    </div>,

    /* Step 1 — About */
    <div key="about" className="flex flex-col gap-5 py-4">
      <h2 className="text-2xl font-bold text-primary">عن المجتمع</h2>
      <div className="space-y-4">
        {[
          { icon: '🤝', title: 'شبكة مهنية حصرية', desc: 'تواصل مع نخبة المسوقين في العالم العربي' },
          { icon: '💡', title: 'تبادل المعرفة', desc: 'مقالات، نقاشات، وفرص تعليمية متخصصة' },
          { icon: '🎯', title: 'فرص حصرية', desc: 'وظائف واستشارات وشراكات في مجال التسويق' },
          { icon: '🗓️', title: 'فعاليات احترافية', desc: 'مؤتمرات، ورش عمل، ولقاءات تواصل' },
        ].map(item => (
          <div key={item.title} className="flex items-start gap-4 bg-primary/5 rounded-xl p-4">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-primary">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={goNext} className="btn-primary w-full py-3 mt-2">التالي</button>
    </div>,

    /* Step 2 — How it works */
    <div key="how" className="flex flex-col gap-5 py-4">
      <h2 className="text-2xl font-bold text-primary">كيف يعمل المجتمع؟</h2>
      <div className="space-y-3">
        {[
          { num: '1', title: 'الأعضاء', desc: 'انضم وتواصل مع مئات المسوقين العرب' },
          { num: '2', title: 'النقاشات', desc: 'شارك أفكارك واطرح أسئلتك المهنية' },
          { num: '3', title: 'الفعاليات', desc: 'سجّل في الندوات والمؤتمرات والورش' },
          { num: '4', title: 'الفرص', desc: 'اكتشف وظائف واستشارات في مجالك' },
          { num: '5', title: 'المقالات', desc: 'تعلّم من مقالات كتبها خبراء التسويق' },
        ].map(item => (
          <div key={item.num} className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
              {item.num}
            </div>
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={goNext} className="btn-primary w-full py-3 mt-2">التالي</button>
    </div>,

    /* Step 3 — Interests */
    <div key="interests" className="flex flex-col gap-5 py-4">
      <h2 className="text-2xl font-bold text-primary">اختر اهتماماتك</h2>
      <p className="text-gray-500 text-sm">سيساعدنا ذلك في تخصيص المحتوى لك</p>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map(interest => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
              selectedInterests.includes(interest)
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 text-gray-600 hover:border-primary/50'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">دولتك</label>
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="">اختر دولتك</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <button onClick={goNext} disabled={selectedInterests.length === 0} className="btn-primary w-full py-3 mt-2 disabled:opacity-50">
        التالي
      </button>
    </div>,

    /* Step 4 — Start */
    <div key="start" className="flex flex-col items-center text-center gap-6 py-6">
      <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-5xl">🎉</div>
      <h2 className="text-2xl font-bold text-primary">أنت جاهز تماماً!</h2>
      <p className="text-gray-500 max-w-sm leading-relaxed">
        تم إعداد حسابك بنجاح. يمكنك الآن استكشاف المجتمع والتواصل مع أعضائه.
      </p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <a href="/members" className="text-center bg-primary/10 text-primary rounded-xl py-3 text-sm font-medium hover:bg-primary/20 transition-colors">
          الأعضاء
        </a>
        <a href="/discussions" className="text-center bg-primary/10 text-primary rounded-xl py-3 text-sm font-medium hover:bg-primary/20 transition-colors">
          النقاشات
        </a>
        <a href="/events" className="text-center bg-primary/10 text-primary rounded-xl py-3 text-sm font-medium hover:bg-primary/20 transition-colors">
          الفعاليات
        </a>
        <a href="/opportunities" className="text-center bg-primary/10 text-primary rounded-xl py-3 text-sm font-medium hover:bg-primary/20 transition-colors">
          الفرص
        </a>
      </div>
      <button onClick={handleComplete} disabled={loading} className="btn-primary w-full max-w-xs py-3 text-lg">
        {loading ? 'جاري التهيئة...' : 'ابدأ الآن →'}
      </button>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header progress */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400 font-medium">الخطوة {step + 1} من {totalSteps}</div>
            {step > 0 && step < totalSteps - 1 && (
              <button onClick={() => setStep(s => s - 1)} className="text-xs text-gray-400 hover:text-gray-600">
                ← السابق
              </button>
            )}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {steps[step]}
        </div>
      </div>
    </div>
  );
}
