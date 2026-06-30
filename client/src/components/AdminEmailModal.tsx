import { useState } from 'react';
import { Mail, X, Bell } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onClose: () => void;
}

export default function AdminEmailModal({ onClose }: Props) {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!email.trim()) { setError('أدخل بريدك الإلكتروني'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('البريد الإلكتروني غير صحيح'); return; }

    setLoading(true);
    try {
      const res = await api.put('/auth/me', { notificationEmail: email });
      setUser(res.data);
      onClose();
    } catch {
      setError('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a7f] p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold">إعداد بريد الإشعارات</h2>
          <p className="text-sm text-white/75 mt-1">
            أدخل بريدك الإلكتروني لاستلام إشعارات طلبات العضوية والتقارير والتنبيهات
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            البريد الإلكتروني للإشعارات
          </label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="example@domain.com"
              className="w-full border border-gray-200 rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              dir="ltr"
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-2">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#2a4a7f] transition-colors disabled:opacity-60"
            >
              {loading ? 'جارٍ الحفظ...' : 'حفظ البريد'}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              تخطي
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            سيظل هذا الطلب يظهر عند كل تسجيل دخول حتى تُحدد بريدًا للإشعارات
          </p>
        </div>
      </div>
    </div>
  );
}
