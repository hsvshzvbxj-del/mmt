import { useEffect } from 'react';
import { useToastState } from '../../hooks/useToast';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function Toaster() {
  const { toasts, subscribe } = useToastState();

  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-up max-w-sm ${
          t.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          t.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {t.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
          {t.type === 'error' && <XCircle className="w-4 h-4 shrink-0" />}
          {t.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}
