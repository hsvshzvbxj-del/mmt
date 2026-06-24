import { Link, useLocation } from 'wouter';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
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
  ];

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50 transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="مجتمع مبادرة تسويقية" className="h-14 w-auto group-hover:opacity-90 transition-opacity drop-shadow-sm" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-foreground/80'}`}
            >
              {link.label}
            </Link>
          ))}
          
          {isAuthenticated && authLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-foreground/80'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {user?.name?.charAt(0) || 'M'}
                </div>
                <span>{user?.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-card rounded-md shadow-lg border py-1">
                  {(user?.role === 'admin' || user?.role === 'moderator') && (
                    <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-muted w-full text-right" onClick={() => setDropdownOpen(false)}>لوحة الإدارة</Link>
                  )}
                  <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-muted w-full text-right" onClick={() => setDropdownOpen(false)}>الملف الشخصي</Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted w-full text-right">
                    <LogOut className="w-4 h-4" /> تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                تسجيل الدخول
              </Link>
              <Link href="/join" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                انضم للمجتمع
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card absolute w-full left-0 shadow-lg">
          <div className="flex flex-col p-4 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated && authLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            
            <div className="border-t pt-4 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {user?.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                  </div>
                  {(user?.role === 'admin' || user?.role === 'moderator') && (
                    <Link href="/admin" className="block p-2 text-sm hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>لوحة الإدارة</Link>
                  )}
                  <Link href="/profile" className="block p-2 text-sm hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>الملف الشخصي</Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 p-2 text-sm text-destructive hover:bg-muted rounded-md w-full text-right mt-2">
                    <LogOut className="w-4 h-4" /> تسجيل الخروج
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" className="p-2 text-sm font-medium hover:bg-muted rounded-md text-center border" onClick={() => setMobileMenuOpen(false)}>
                    تسجيل الدخول
                  </Link>
                  <Link href="/join" className="bg-primary text-primary-foreground p-2 rounded-md text-sm font-medium text-center" onClick={() => setMobileMenuOpen(false)}>
                    انضم للمجتمع
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
