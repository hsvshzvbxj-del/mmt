import { Link, useLocation } from 'wouter';
import { useAuth } from '../../hooks/useAuth';
import { Redirect } from 'wouter';
import {
  LayoutDashboard, Users, ClipboardList, Calendar,
  Briefcase, BookOpen, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/members', label: 'الأعضاء', icon: Users },
  { href: '/admin/applications', label: 'طلبات العضوية', icon: ClipboardList },
  { href: '/admin/events', label: 'الفعاليات', icon: Calendar },
  { href: '/admin/opportunities', label: 'الفرص', icon: Briefcase },
  { href: '/admin/articles', label: 'المقالات', icon: BookOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (user && !['admin', 'moderator'].includes(user.role)) return <Redirect to="/" />;

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-[#0a1526] text-white flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <Link href="/">
            <img src="/logo.png" alt="MIC" className="h-10 w-auto brightness-0 invert" />
          </Link>
          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                location === href
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {location === href && <ChevronRight className="w-4 h-4 mr-auto rotate-180" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center font-bold text-secondary text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-white/50 truncate">{user?.role === 'admin' ? 'مدير' : 'مشرف'}</div>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-xs text-white/60 hover:text-white rounded-md hover:bg-white/10 transition-colors">
            العودة للموقع
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-xs text-white/60 hover:text-red-400 rounded-md hover:bg-white/10 transition-colors w-full text-right mt-1">
            <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button className="md:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">لوحة الإدارة</h1>
            <p className="text-xs text-muted-foreground">مجتمع مبادرة تسويقية</p>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
