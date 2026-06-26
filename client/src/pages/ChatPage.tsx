import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../hooks/useToast';
import api from '../lib/api';
import { Send, Trash2, MessageCircle, Users, Hash, Loader2 } from 'lucide-react';
import Toaster from '../components/ui/Toaster';

interface ChatMsg {
  id: string;
  content: string;
  room: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    specialization?: string;
    role: string;
  };
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return 'الآن';
  if (diffSec < 3600) return `منذ ${Math.floor(diffSec / 60)} د`;
  if (diffSec < 86400) return `منذ ${Math.floor(diffSec / 3600)} س`;
  return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
}

function Avatar({ name, avatarUrl, size = 'sm' }: { name?: string; avatarUrl?: string; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  if (avatarUrl) return <img src={avatarUrl} alt={name} className={`${cls} rounded-full object-cover`} />;
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-primary to-[#2a4a7f] text-white flex items-center justify-center font-bold shrink-0`}>
      {name?.charAt(0) || '?'}
    </div>
  );
}

const ROOMS = [
  { id: 'general', label: 'النقاش العام', icon: Hash },
  { id: 'marketing', label: 'التسويق الرقمي', icon: Hash },
  { id: 'opportunities', label: 'الفرص والشراكات', icon: Hash },
  { id: 'branding', label: 'بناء العلامة', icon: Hash },
];

export default function ChatPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [room, setRoom] = useState('general');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstLoad = useRef(true);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      const res = await api.get('/chat', { params: { room, limit: 60 } });
      setMessages(res.data);
      if (res.data.length > 0) {
        lastTimestampRef.current = res.data[res.data.length - 1].createdAt;
      }
    } catch {}
  }, [room]);

  // Poll for new messages
  const poll = useCallback(async () => {
    if (!lastTimestampRef.current) return;
    try {
      const res = await api.get('/chat/poll', {
        params: { room, since: lastTimestampRef.current },
      });
      if (res.data.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map((m: ChatMsg) => m.id));
          const newMsgs = res.data.filter((m: ChatMsg) => !existingIds.has(m.id));
          if (newMsgs.length === 0) return prev;
          const updated = [...prev, ...newMsgs];
          lastTimestampRef.current = updated[updated.length - 1].createdAt;
          return updated;
        });
      }
    } catch {}
  }, [room]);

  useEffect(() => {
    firstLoad.current = true;
    setMessages([]);
    lastTimestampRef.current = null;
    loadMessages();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [room, loadMessages]);

  // Start polling after messages are loaded
  useEffect(() => {
    if (pollRef.current) clearTimeout(pollRef.current);

    const schedulePoll = () => {
      pollRef.current = setTimeout(async () => {
        await poll();
        schedulePoll();
      }, 3000);
    };

    schedulePoll();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [poll]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (firstLoad.current) {
      bottomRef.current?.scrollIntoView();
      firstLoad.current = false;
    } else {
      // Only auto-scroll if near bottom
      const container = bottomRef.current?.parentElement;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollHeight - scrollTop - clientHeight < 200) {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages]);

  const send = useMutation({
    mutationFn: () => api.post('/chat', { content: text.trim(), room }),
    onSuccess: (res) => {
      setMessages(prev => {
        const updated = [...prev, res.data];
        lastTimestampRef.current = res.data.createdAt;
        return updated;
      });
      setText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    },
    onError: (err: any) => toast(err.response?.data?.error || 'فشل إرسال الرسالة', 'error'),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/chat/${id}`),
    onSuccess: (_, id) => setMessages(prev => prev.filter(m => m.id !== id)),
    onError: () => toast('فشل حذف الرسالة', 'error'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || send.isPending) return;
    send.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-80px)] flex flex-col md:flex-row">
      <Toaster />

      {/* Sidebar - Rooms */}
      <div className="md:w-60 border-b md:border-b-0 md:border-l bg-[#0a1526] text-white flex md:flex-col overflow-x-auto md:overflow-x-visible">
        <div className="hidden md:block p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="font-bold text-sm">الشات الجماعي</div>
              <div className="text-xs text-white/50">تحديث فوري</div>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col p-2 gap-1 flex-1">
          {ROOMS.map(r => (
            <button
              key={r.id}
              onClick={() => setRoom(r.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                room === r.id
                  ? 'bg-secondary/20 text-secondary'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              <r.icon className="w-4 h-4 shrink-0" />
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
        {/* Header */}
        <div className="bg-white border-b px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold text-foreground">
              {ROOMS.find(r => r.id === room)?.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            مباشر
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-muted-foreground font-medium">لا توجد رسائل بعد</p>
              <p className="text-sm text-muted-foreground/70 mt-1">ابدأ النقاش وشارك الجميع!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.author.id === user?.id;
              const prevMsg = messages[i - 1];
              const isGrouped = prevMsg?.author.id === msg.author.id &&
                new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 120000;

              return (
                <div key={msg.id} className={`flex gap-2.5 group ${isMe ? 'flex-row-reverse' : ''} ${isGrouped ? 'mt-0.5' : 'mt-3'}`}>
                  {!isGrouped ? (
                    <Avatar name={msg.author.name} avatarUrl={msg.author.avatarUrl} />
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}

                  <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isGrouped && (
                      <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-semibold text-foreground">{msg.author.name}</span>
                        {msg.author.role === 'admin' && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">مدير</span>
                        )}
                        {msg.author.role === 'moderator' && (
                          <span className="text-xs bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-md">مشرف</span>
                        )}
                        <span className="text-xs text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                      </div>
                    )}

                    <div className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary text-white rounded-tl-md'
                        : 'bg-white border shadow-sm text-foreground rounded-tr-md'
                    }`}>
                      {msg.content}
                      {/* Delete button */}
                      {(isMe || ['admin', 'moderator'].includes(user?.role || '')) && (
                        <button
                          onClick={() => {
                            if (confirm('حذف هذه الرسالة؟')) del.mutate(msg.id);
                          }}
                          className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center transition-opacity shadow-md"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t px-4 py-3 shrink-0">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <Avatar name={user?.name} size="md" />
            <div className="flex-1 relative">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`اكتب رسالتك في #${ROOMS.find(r => r.id === room)?.label}...`}
                rows={1}
                className="w-full resize-none bg-gray-100 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all max-h-32 overflow-y-auto"
                style={{ minHeight: '44px' }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px';
                }}
              />
              <div className="absolute left-3 bottom-2.5 text-xs text-muted-foreground/60">
                Enter للإرسال
              </div>
            </div>
            <button
              type="submit"
              disabled={!text.trim() || send.isPending}
              className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-primary/20 hover:-translate-y-0.5"
            >
              {send.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
