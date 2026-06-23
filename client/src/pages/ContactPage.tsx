import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Twitter, Linkedin, Instagram, MessageSquare } from 'lucide-react';
import Toaster from '../components/ui/Toaster';
import { toast } from '../hooks/useToast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast('تم إرسال رسالتك بنجاح! سنتواصل معك خلال 48 ساعة.', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <Toaster />
      <section className="bg-[#0a1526] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-secondary/15 text-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">نحن هنا</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">تواصل معنا</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-loose">نحن هنا للإجابة على استفساراتك ومساعدتك في كل ما تحتاج.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">أرسل لنا رسالة</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الاسم الكامل</label>
                  <input
                    type="text" required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background"
                    placeholder="اسمك الكامل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background"
                    placeholder="you@example.com"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">موضوع الرسالة</label>
                <input
                  type="text" required
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background"
                  placeholder="بماذا يمكننا مساعدتك؟"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">الرسالة</label>
                <textarea
                  required rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none bg-background"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send className="w-4 h-4" /> إرسال الرسالة</>
                }
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5">معلومات التواصل</h2>
              <div className="space-y-3">
                {[
                  { icon: Mail, label: 'البريد الإلكتروني', value: 'info@marketing-initiative.com', href: 'mailto:info@marketing-initiative.com' },
                  { icon: MapPin, label: 'الموقع', value: 'الرياض، المملكة العربية السعودية', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:border-primary/30 hover:shadow-sm transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                      {href
                        ? <a href={href} className="font-medium text-foreground text-sm hover:text-primary transition-colors">{value}</a>
                        : <div className="font-medium text-foreground text-sm">{value}</div>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">تابعنا على</h3>
              <div className="flex gap-3">
                {[
                  { icon: Twitter, label: 'Twitter', bg: 'hover:bg-sky-500' },
                  { icon: Linkedin, label: 'LinkedIn', bg: 'hover:bg-blue-600' },
                  { icon: Instagram, label: 'Instagram', bg: 'hover:bg-pink-500' },
                ].map(({ icon: Icon, label, bg }) => (
                  <a key={label} href="#" aria-label={label} className={`w-11 h-11 rounded-xl bg-primary/8 text-primary flex items-center justify-center ${bg} hover:text-white transition-all hover:-translate-y-0.5`}>
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0a1526] to-[#1e3a5f] text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <h3 className="font-bold mb-2 text-lg">للانضمام للمجتمع</h3>
                <p className="text-white/60 text-sm mb-4 leading-relaxed">إذا كنت مهتماً بالانضمام كعضو، يمكنك تقديم طلبك مباشرةً الآن.</p>
                <a href="/join" className="inline-block bg-secondary text-[#0a1526] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-secondary/90 transition-colors">
                  تقدم للعضوية
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
