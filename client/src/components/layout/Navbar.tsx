import { Link, useLocation } from 'wouter';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, LogOut, ChevronDown, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import NotificationBell from '../ui/NotificationBell';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const publicLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/about', label: 'عن المجتمع' },
    { href: '/events', label: 'الفعاليات' },
    { href: '/knowledge', label: 'المعرفة' },
    { href: '/contact', label: 'تواصل معنا' },
  ];

  const authLinks = [
    { href: '/members', label: 'الأعضاء' },
    { href: '/opportunities', label: 'الفرص' },
    { href: '/discussions', label: 'النقاشات' },
    { href: '/chat', label: 'الشات', icon: MessageCircle },
  ];

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    setLocation('/login');
  };

  const isActive = (href: string) => href === '/' ? location === '/' : location.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50 transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <img
            src="/logo.png"
            alt="مجتمع مبادرة تسويقية"
            className="h-14 w-auto group-hover:opacity-90 transition-opacity drop-shadow-sm"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary relative ${
                isActive(link.href)
                  ? 'text-primary after:absolute after:-bottom-1 after:right-0 after:left-0 after:h-0.5 after:bg-primary after:rounded-full'
                  : 'text-foreground/80'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary relative flex items-center gap-1.5 ${
                isActive(link.href)
                  ? 'text-primary after:absolute after:-bottom-1 after:right-0 after:left-0 after:h-0.5 after:bg-primary after:rounded-full'
                  : 'text-foreground/80'
              }`}
            >
              {link.icon && <link.icon className="w-3.5 h-3.5" />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 text-sm font-medium hover:text-primary transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#2a4a7f] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {user?.name?.charAt(0) || 'م'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border py-1.5 z-50 animate-slide-up">
                      <div className="px-4 py-2.5 border-b mb-1">
                        <div className="text-sm font-semibold text-foreground truncate">{user?.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {user?.role === 'admin' ? '🔴 مدير' : user?.role === 'moderator' ? '🟡 مشرف' : '🟢 عضو'}
                        </div>
                      </div>
                      {(user?.role === 'admin' || user?.role === 'moderator') && (
                        <Link href="/admin" className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                          لوحة الإدارة
                        </Link>
                      )}
                      <Link href="/profile" className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                        الملف الشخصي
                      </Link>
                      <div className="border-t mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full text-right"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-3 py-2">
                تسجيل الدخول
              </Link>
              <Link
                href="/join"
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-primary/20"
              >
                انضم إلينا
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="قائمة التنقل"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white/95 backdrop-blur-sm">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {publicLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href) ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="border-t my-2" />
                {authLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href) ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-foreground/80'
                    }`}
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                ))}
                <div className="border-t my-2" />
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100">
                    لوحة الإدارة
                  </Link>
                )}
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100">
                  الملف الشخصي
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 w-full text-right"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex gap-2 pt-2 border-t">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 border rounded-lg text-sm font-medium">
                  تسجيل الدخول
                </Link>
                <Link href="/join" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 bg-primary text-white rounded-lg text-sm font-medium">
                  انضم إلينا
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
