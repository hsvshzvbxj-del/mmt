import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../hooks/useToast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Toaster from '../components/ui/Toaster';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    setLocation('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast('مرحباً بك! تم تسجيل الدخول بنجاح', 'success');
      setLocation('/');
    } catch {
      toast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a1526]">
      <Toaster />
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1526] to-[#1e3a5f]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative z-10 text-center">
          <img src="/logo.png" alt="مجتمع مبادرة تسويقية" className="h-40 w-auto mx-auto mb-10" />
          <h2 className="text-3xl font-bold text-white mb-4">مرحباً بك مجدداً</h2>
          <p className="text-white/60 max-w-sm leading-relaxed">
            سجّل دخولك للوصول إلى المجتمع ومتابعة آخر الفعاليات والفرص والنقاشات المهنية.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/logo.png" alt="MIC" className="h-24 w-auto" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">تسجيل الدخول</h1>
          <p className="text-muted-foreground mb-8">
            ليس لديك حساب؟{' '}
            <Link href="/join" className="text-primary font-medium hover:underline">
              تقدم للعضوية
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                data-testid="input-email"
                className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                  className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pl-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="button-submit"
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4" /> تسجيل الدخول</>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">بيانات تجريبية:</p>
            <p>مدير: admin@micommunity.com / Admin@1234</p>
            <p>عضو: sara@example.com / Member@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
