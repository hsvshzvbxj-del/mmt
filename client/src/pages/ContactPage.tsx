import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Twitter, Linkedin, Instagram } from 'lucide-react';
import Toaster from '../components/ui/Toaster';
import { toast } from '../hooks/useToast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
    setForm({ name: '', email: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <Toaster />
      <section className="bg-[#0a1526] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">تواصل معنا</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">نحن هنا للإجابة على استفساراتك ومساعدتك في كل ما تحتاج.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6">أرسل لنا رسالة</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">الاسم</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="اسمك الكامل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">الرسالة</label>
                <textarea
                  required rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> إرسال الرسالة</>}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">معلومات التواصل</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'البريد الإلكتروني', value: 'info@micommunity.com' },
                  { icon: Phone, label: 'الهاتف', value: '+971 4 XXX XXXX' },
                  { icon: MapPin, label: 'الموقع', value: 'دبي، الإمارات العربية المتحدة' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 p-4 bg-white rounded-xl border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="font-medium text-foreground">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">تابعنا على</h3>
              <div className="flex gap-4">
                {[
                  { icon: Twitter, label: 'Twitter', color: 'hover:bg-blue-400' },
                  { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-600' },
                  { icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-500' },
                ].map(({ icon: Icon, label, color }) => (
                  <a key={label} href="#" className={`w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center ${color} hover:text-white transition-all`}>
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/10 rounded-2xl p-6 border border-primary/10">
              <h3 className="font-bold text-foreground mb-2">للانضمام للمجتمع</h3>
              <p className="text-muted-foreground text-sm mb-4">إذا كنت مهتماً بالانضمام كعضو، يمكنك تقديم طلبك مباشرة.</p>
              <a href="/join" className="inline-block bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                تقدم للعضوية
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
