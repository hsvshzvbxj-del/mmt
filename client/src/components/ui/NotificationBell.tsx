import { useEffect, useRef } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const TYPE_ICON: Record<string, string> = {
  message: '💬', mention: '🏷️', reply: '↩️', like: '❤️',
  event: '🗓️', opportunity: '💼', article: '📝', application: '📋',
  report: '🚨', ban: '🚫', unban: '✅', mute: '🔇',
  role_change: '👑', welcome: '🎉', system: '⚙️',
};

const TYPE_BG: Record<string, string> = {
  message: 'bg-blue-100', mention: 'bg-purple-100', reply: 'bg-indigo-100',
  like: 'bg-rose-100', event: 'bg-emerald-100', opportunity: 'bg-teal-100',
  article: 'bg-amber-100', application: 'bg-orange-100', report: 'bg-red-100',
  ban: 'bg-red-200', unban: 'bg-green-100', mute: 'bg-yellow-100',
  role_change: 'bg-violet-100', welcome: 'bg-pink-100', system: 'bg-gray-100',
};

function TimeAgo({ date }: { date: string }) {
  try {
    return <>{formatDistanceToNow(new Date(date), { locale: ar, addSuffix: true })}</>;
  } catch {
    return <>الآن</>;
  }
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const {
    unreadCount, notifications, loading, panelOpen,
    togglePanel, closePanel,
    markRead, markAllRead, remove, clearAll, pollUnread,
  } = useNotifications();

  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Polling كل 30 ثانية ── */
  useEffect(() => {
    if (!isAuthenticated) return;
    pollUnread();
    const id = setInterval(pollUnread, 30_000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  /* ── إغلاق عند الضغط خارج الـ panel ── */
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) closePanel();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen]);

  /* ── إغلاق بـ ESC ── */
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [panelOpen]);

  function handleClick(notif: any) {
    if (!notif.isRead) markRead(notif._id);
    if (notif.link) { closePanel(); window.location.href = notif.link; }
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── زر الجرس ── */}
      <button
        onClick={togglePanel}
        aria-label="الإشعارات"
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
          panelOpen ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Backdrop ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          panelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closePanel}
      />

      {/* ── Sidebar Panel ── */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[390px] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-l from-[#1e3a5f] to-[#2a4a7f] text-white shrink-0">
          <button
            onClick={closePanel}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex-1">
            <h2 className="font-bold text-[15px] leading-tight">الإشعارات</h2>
            <p className="text-[11px] text-white/60 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} غير مقروء` : 'لا توجد إشعارات جديدة'}
            </p>
          </div>

          <div className="flex gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-medium bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors"
              >
                قراءة الكل
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] bg-white/10 hover:bg-red-500/30 px-2.5 py-1.5 rounded-lg transition-colors"
                title="مسح كل الإشعارات"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Tabs strip (unread / all) */}
        <div className="flex border-b border-gray-100 bg-gray-50 shrink-0">
          {[
            { label: 'الكل', count: notifications.length },
            { label: 'غير مقروء', count: unreadCount },
          ].map((t, i) => (
            <div key={i} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-gray-500 font-medium">
              {t.label}
              {t.count > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] px-1.5 rounded-full">{t.count}</span>
              )}
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="p-5 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-4xl mb-4 shadow-inner">
                🔔
              </div>
              <p className="font-semibold text-gray-700 mb-2">لا توجد إشعارات بعد</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                ستظهر هنا إشعاراتك فور حدوث أي تفاعل أو نشاط
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notif, idx) => {
                const isFirst = idx === 0;
                const prevDate = idx > 0 ? new Date(notifications[idx - 1].createdAt).toDateString() : null;
                const currDate = new Date(notif.createdAt).toDateString();
                const showDateDivider = isFirst || prevDate !== currDate;

                return (
                  <div key={notif._id}>
                    {showDateDivider && (
                      <div className="flex items-center gap-3 px-5 py-2">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}

                    <div
                      onClick={() => handleClick(notif)}
                      className={`group relative flex items-start gap-3 px-4 py-3.5 transition-colors cursor-pointer ${
                        notif.isRead
                          ? 'hover:bg-gray-50'
                          : 'bg-gradient-to-l from-primary/[0.04] to-transparent hover:from-primary/[0.07]'
                      } ${notif.link ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {/* Unread indicator */}
                      {!notif.isRead && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                      )}

                      {/* Avatar / Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${TYPE_BG[notif.type] || 'bg-gray-100'}`}>
                        {notif.triggeredBy?.avatarUrl ? (
                          <img
                            src={notif.triggeredBy.avatarUrl}
                            alt={notif.triggeredBy.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : notif.triggeredBy ? (
                          <span className="text-sm font-bold text-gray-600">
                            {notif.triggeredBy.name?.[0]}
                          </span>
                        ) : (
                          <span>{TYPE_ICON[notif.type] || '🔔'}</span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] leading-snug ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[11px] text-gray-400">
                            <TimeAgo date={notif.createdAt} />
                          </span>
                          {notif.triggeredBy && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="text-[11px] text-gray-400">{notif.triggeredBy.name}</span>
                            </>
                          )}
                          {notif.link && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="text-[11px] text-primary font-medium">اضغط للعرض</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={e => { e.stopPropagation(); remove(notif._id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-300 shrink-0"
                        title="حذف"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 shrink-0 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">يتم التحديث كل 30 ثانية</p>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="متصل" />
        </div>
      </div>
    </>
  );
}
