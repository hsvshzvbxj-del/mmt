import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, X } from 'lucide-react';
import api from '../../lib/api';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray.buffer;
}

type Status = 'idle' | 'subscribed' | 'denied' | 'loading' | 'unsupported';

export default function NotificationBell() {
  const [status, setStatus] = useState<Status>('idle');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setStatus('denied');
    } else if (Notification.permission === 'granted') {
      // Check if there's an active subscription
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setStatus(sub ? 'subscribed' : 'idle');
        });
      });
    }
  }, []);

  const subscribe = async () => {
    if (status === 'loading') return;
    setStatus('loading');

    try {
      const { data } = await api.get('/push/vapid-public-key');
      const reg = await navigator.serviceWorker.ready;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });

      const sub = subscription.toJSON();
      await api.post('/push/subscribe', {
        endpoint: sub.endpoint,
        keys: sub.keys,
      });

      setStatus('subscribed');
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || Notification.permission === 'denied') {
        setStatus('denied');
      } else {
        setStatus('idle');
        console.error('Push subscription failed', err);
      }
    }
  };

  const unsubscribe = async () => {
    setStatus('loading');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.delete('/push/unsubscribe', { data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setStatus('idle');
    } catch {
      setStatus('subscribed');
    }
  };

  if (status === 'unsupported') return null;

  return (
    <div className="relative">
      <button
        onClick={status === 'subscribed' ? unsubscribe : subscribe}
        title={
          status === 'subscribed' ? 'إلغاء الإشعارات' :
          status === 'denied' ? 'الإشعارات محجوبة في المتصفح' :
          'تفعيل الإشعارات'
        }
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
          status === 'subscribed'
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : status === 'denied'
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        {status === 'loading' ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : status === 'subscribed' ? (
          <>
            <Bell className="w-4 h-4 fill-primary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
          </>
        ) : status === 'denied' ? (
          <BellOff className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
      </button>

      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-emerald-600 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg flex items-center gap-1.5 z-50">
          <CheckCircle className="w-3.5 h-3.5" />
          تم تفعيل الإشعارات!
        </div>
      )}
    </div>
  );
}
