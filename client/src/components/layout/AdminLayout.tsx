import { Link, useLocation } from 'wouter';
import { useAuth } from '../../hooks/useAuth';
import { Redirect } from 'wouter';
import {
  LayoutDashboard, Users, ClipboardList, Calendar,
  Briefcase, BookOpen, LogOut, Menu, X, ChevronRight,
  Shield, MessageSquare, ScrollText
} from 'lucide-react';
import { useState } from 'react';

const ADMIN_ROLES = ['super_admin', 'admin', 'moderator', 'senior_moderator', 'editor', 'reviewer', 'support'];

const navItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/members', label: 'الأعضاء', icon: Users },
  { href: '/admin/applications', label: 'طلبات العضوية', icon: ClipboardList },
  { href: '/admin/moderation', label: 'مركز الإشراف', icon: Shield },
  { href: '/admin/events', label: 'الفعاليات', icon: Calendar },
  { href: '/admin/opportunities', label: 'الفرص', icon: Briefcase },
  { href: '/admin/articles', label: 'المقالات', icon: BookOpen },
  { href: '/admin/audit', label: 'سجل الأنشطة', icon: ScrollText },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'المدير الأعلى', admin: 'مدير', moderator: 'مشرف',
  senior_moderator: 'مشرف أول', editor: 'محرر', reviewer: 'مراجع',
  support: 'دعم فني', member: 'عضو', guest: 'زائر',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (user && !ADMIN_ROLES.includes(user.role)) return <Redirect to="/" />;

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-[#0a1526] text-white flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <Link href="/">
            <img src="/logo.png" alt="MIC" className="h-10 w-auto drop-shadow-md" />
          </Link>
          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/65 hover:text-white hover:bg-white/8'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 mr-auto rotate-180 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary text-sm shrink-0">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-white/40 truncate">{ROLE_LABELS[user?.role || ''] || user?.role}</div>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white rounded-lg hover:bg-white/8 transition-colors">
            ← العودة للموقع
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-red-400 rounded-lg hover:bg-white/8 transition-colors w-full text-right mt-0.5">
            <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-4 sticky top-0 z-30">
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">لوحة الإدارة</h1>
            <p className="text-xs text-gray-400">مجتمع مبادرة تسويقية</p>
          </div>
          <div className="mr-auto flex items-center gap-2">
            <Link href="/admin/moderation">
              <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                <Shield className="w-3.5 h-3.5" />
                <span>الإشراف</span>
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
