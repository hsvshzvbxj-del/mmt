import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../hooks/useToast';
import { useScreenshotDetect } from '../hooks/useScreenshotDetect';
import api from '../lib/api';
import {
  Send, Trash2, Hash, Smile, Reply, X, Users, Check, CheckCheck,
  Shield, Eye, EyeOff, MoreVertical, ChevronDown
} from 'lucide-react';
import Toaster from '../components/ui/Toaster';

/* ─── types ─── */
interface ReadEntry { userId: string; name: string; readAt: string }
interface Reaction  { userId: string; emoji: string }
interface Author    { id: string; name: string; avatarUrl?: string; specialization?: string; role: string }
interface ChatMsg {
  id: string; content: string; room: string; type: string;
  createdAt: string; updatedAt: string;
  replyToId?: string; readBy: ReadEntry[]; reactions: Reaction[];
  visibleTo: string[] | null; author: Author;
}
interface Member { id: string; name: string; avatarUrl?: string; specialization?: string; role: string }

/* ─── constants ─── */
const ROOMS = [
  { id: 'general',      label: 'النقاش العام',       emoji: '💬' },
  { id: 'marketing',   label: 'التسويق الرقمي',     emoji: '📈' },
  { id: 'opportunities',label: 'الفرص والشراكات',   emoji: '🤝' },
  { id: 'branding',    label: 'بناء العلامة',       emoji: '🎨' },
];
const EMOJIS = ['👍','❤️','😂','😮','😢','🔥','🎯','💡','✅','🙌'];

/* ─── helpers ─── */
function msgTime(d: string) {
  const date = new Date(d);
  return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}
function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function groupByDate(msgs: ChatMsg[]) {
  const groups: { date: string; msgs: ChatMsg[] }[] = [];
  let last = '';
  for (const m of msgs) {
    const d = new Date(m.createdAt);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    let label = d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });
    if (d.toDateString() === today.toDateString()) label = 'اليوم';
    else if (d.toDateString() === yesterday.toDateString()) label = 'أمس';
    if (label !== last) { groups.push({ date: label, msgs: [] }); last = label; }
    groups[groups.length - 1].msgs.push(m);
  }
  return groups;
}

/* ─── Avatar ─── */
function Avatar({ name, url, size = 9 }: { name?: string; url?: string; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full shrink-0 object-cover`;
  if (url) return <img src={url} alt={name} className={cls} />;
  const colors = ['bg-blue-500','bg-purple-500','bg-emerald-500','bg-orange-500','bg-pink-500','bg-teal-500'];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`${cls} ${colors[idx]} flex items-center justify-center text-white font-bold text-xs`}>
      {getInitials(name)}
    </div>
  );
}

/* ─── Read receipt icon ─── */
function ReadReceipt({ readBy, myId }: { readBy: ReadEntry[]; myId: string }) {
  const others = readBy.filter(r => r.userId !== myId);
  if (others.length === 0) return <Check className="w-3.5 h-3.5 text-white/50" />;
  return <CheckCheck className="w-3.5 h-3.5 text-sky-300" aria-label={`قرأه: ${others.map(r => r.name).join('، ')}`} />;
}

/* ─── Reactions bar ─── */
function ReactionsBar({ reactions, myId, onReact }: { reactions: Reaction[]; myId: string; onReact: (e: string) => void }) {
  if (reactions.length === 0) return null;
  const grouped = reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || []).concat(r.userId); return acc; }, {} as Record<string,string[]>);
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(grouped).map(([emoji, users]) => (
        <button key={emoji} onClick={() => onReact(emoji)}
          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-all
            ${users.includes(myId) ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-white/80 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
          <span>{emoji}</span><span className="font-medium">{users.length}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Message bubble ─── */
function MessageBubble({
  msg, isMe, isAdmin, myId, allMsgs, onReply, onDelete, onReact, members
}: {
  msg: ChatMsg; isMe: boolean; isAdmin: boolean; myId: string;
  allMsgs: ChatMsg[]; onReply: (m: ChatMsg) => void;
  onDelete: (id: string) => void; onReact: (id: string, emoji: string) => void;
  members: Member[];
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const replyMsg = msg.replyToId ? allMsgs.find(m => m.id === msg.replyToId) : null;
  const isTargeted = msg.visibleTo && msg.visibleTo.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const targetedNames = isTargeted
    ? msg.visibleTo!.map(id => members.find(m => m.id === id)?.name || id).join('، ')
    : '';

  if (msg.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{msg.content}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 group mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMe && <Avatar name={msg.author.name} url={msg.author.avatarUrl || undefined} size={8} />}

      <div className={`max-w-[75%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isMe && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="text-xs font-semibold text-[#0a1526]">{msg.author.name}</span>
            {msg.author.role === 'admin' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">مدير</span>}
            {msg.author.role === 'moderator' && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">مشرف</span>}
            {msg.author.specialization && <span className="text-[10px] text-gray-400">{msg.author.specialization}</span>}
          </div>
        )}

        <div className="relative" ref={menuRef}>
          {/* Quote reply */}
          {replyMsg && (
            <div className={`text-xs px-3 py-2 rounded-t-xl mb-0.5 border-r-2 border-gray-400 opacity-80
              ${isMe ? 'bg-[#1a6b4a] text-white/80' : 'bg-gray-100 text-gray-600'}`}>
              <span className="font-semibold block">{replyMsg.author.name}</span>
              <span className="truncate block max-w-[200px]">{replyMsg.content}</span>
            </div>
          )}

          {/* Targeted badge */}
          {isTargeted && (
            <div className={`text-[10px] flex items-center gap-1 mb-0.5 ${isMe ? 'text-emerald-300 justify-end' : 'text-gray-400'}`}>
              <Eye className="w-3 h-3" />
              <span>مرئي لـ: {targetedNames}</span>
            </div>
          )}

          {/* Bubble */}
          <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm
            ${isMe
              ? replyMsg ? 'rounded-tr-sm bg-[#1a8f5c]' : 'rounded-tr-sm bg-[#1a8f5c]'
              : replyMsg ? 'rounded-tl-sm bg-white' : 'rounded-tl-sm bg-white'
            }
            ${isMe ? 'text-white' : 'text-gray-800'}`}>

            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>

            <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-[10px] ${isMe ? 'text-white/60' : 'text-gray-400'}`}>{msgTime(msg.createdAt)}</span>
              {isMe && <ReadReceipt readBy={msg.readBy} myId={myId} />}
            </div>

            {/* Context menu trigger */}
            <button
              onClick={() => { setShowMenu(s => !s); setShowEmojiPicker(false); }}
              className={`absolute top-1 ${isMe ? 'left-1' : 'right-1'} opacity-0 group-hover:opacity-100 transition-opacity
                w-6 h-6 rounded-full flex items-center justify-center
                ${isMe ? 'bg-[#1a7a50] hover:bg-[#145c3c]' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <ChevronDown className={`w-3 h-3 ${isMe ? 'text-white/70' : 'text-gray-500'}`} />
            </button>

            {/* Context menu */}
            {showMenu && (
              <div className={`absolute top-7 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[140px]
                ${isMe ? 'left-0' : 'right-0'}`}>
                <button onClick={() => { onReply(msg); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-right">
                  <Reply className="w-3.5 h-3.5 text-gray-400" /> رد
                </button>
                <button onClick={() => { setShowEmojiPicker(true); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-right">
                  <Smile className="w-3.5 h-3.5 text-gray-400" /> تفاعل
                </button>
                {(isMe || isAdmin) && (
                  <button onClick={() => { onDelete(msg.id); setShowMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-right">
                    <Trash2 className="w-3.5 h-3.5" /> {isAdmin && !isMe ? 'حذف خفي' : 'حذف'}
                  </button>
                )}
              </div>
            )}

            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className={`absolute top-7 z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-2
                ${isMe ? 'left-0' : 'right-0'}`}>
                <div className="flex gap-1">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => { onReact(msg.id, e); setShowEmojiPicker(false); }}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg transition-colors">
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ReactionsBar reactions={msg.reactions} myId={myId} onReact={e => onReact(msg.id, e)} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ChatPage() {
  const { user } = useAuth();
  const [room, setRoom] = useState('general');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMsg | null>(null);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [targetedUsers, setTargetedUsers] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [readTooltip, setReadTooltip] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTsRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstLoad = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  useScreenshotDetect(room, true);

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.get('/chat', { params: { room, limit: 80 } });
      setMessages(res.data);
      if (res.data.length > 0) lastTsRef.current = res.data[res.data.length - 1].updatedAt;
    } catch {}
  }, [room]);

  const poll = useCallback(async () => {
    if (!lastTsRef.current) return;
    try {
      const res = await api.get('/chat/poll', { params: { room, since: lastTsRef.current } });
      if (res.data.length > 0) {
        setMessages(prev => {
          const map = new Map(prev.map(m => [m.id, m]));
          for (const m of res.data) map.set(m.id, m);
          const arr = Array.from(map.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          lastTsRef.current = arr[arr.length - 1].updatedAt;
          return arr;
        });
      }
    } catch {}
  }, [room]);

  useEffect(() => {
    firstLoad.current = true;
    setMessages([]);
    setReplyTo(null);
    lastTsRef.current = null;
    loadMessages();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [room, loadMessages]);

  useEffect(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    const schedule = () => { pollRef.current = setTimeout(async () => { await poll(); schedule(); }, 2000); };
    schedule();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [poll]);

  useEffect(() => {
    if (firstLoad.current) { bottomRef.current?.scrollIntoView(); firstLoad.current = false; }
    else {
      const c = bottomRef.current?.parentElement;
      if (c && c.scrollHeight - c.scrollTop - c.clientHeight < 250) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  useEffect(() => {
    api.get('/chat/members').then(r => setMembers(r.data)).catch(() => {});
  }, []);

  const send = useMutation({
    mutationFn: () => api.post('/chat', {
      content: text.trim(), room,
      replyToId: replyTo?.id || undefined,
      visibleTo: targetedUsers.length ? targetedUsers : undefined,
    }),
    onSuccess: (res) => {
      setMessages(prev => {
        const map = new Map(prev.map(m => [m.id, m]));
        map.set(res.data.id, res.data);
        return Array.from(map.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
      lastTsRef.current = res.data.updatedAt;
      setText('');
      setReplyTo(null);
      setTargetedUsers([]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    },
    onError: (e: any) => toast(e.response?.data?.error || 'فشل الإرسال', 'error'),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/chat/${id}`),
    onSuccess: (res, id) => {
      if (res.data.ghostDeleted) {
        // Only admin sees it's ghost-deleted, others just don't see it
        setMessages(prev => prev.filter(m => m.id !== id));
        toast('تم الحذف الخفي ✓', 'success');
      } else {
        setMessages(prev => prev.filter(m => m.id !== id));
      }
    },
    onError: () => toast('فشل الحذف', 'error'),
  });

  const react = useMutation({
    mutationFn: ({ id, emoji }: { id: string; emoji: string }) => api.post(`/chat/${id}/react`, { emoji }),
    onSuccess: (res) => {
      setMessages(prev => prev.map(m => m.id === res.data.id ? res.data : m));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || send.isPending) return;
    send.mutate();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); }
  };

  const groups = groupByDate(messages);
  const roomInfo = ROOMS.find(r => r.id === room);

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-[#eae6df]" dir="rtl">
      <Toaster />

      {/* ── Watermark overlay ── */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none opacity-[0.04]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute text-[#0a1526] text-sm font-bold whitespace-nowrap"
            style={{ top: `${(i * 8.5) % 100}%`, left: `${(i * 17) % 80}%`, transform: 'rotate(-25deg)' }}>
            {user?.name} — {user?.email}
          </div>
        ))}
      </div>

      {/* ── Sidebar ── */}
      <div className={`${sidebarOpen ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-72 lg:w-80 bg-[#111b21] z-20 absolute md:relative inset-0 md:inset-auto`}>
        {/* Header */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} size={10} />
            <div>
              <div className="text-white font-semibold text-sm">{user?.name}</div>
              <div className="text-[#8696a0] text-xs">{isAdmin ? 'مدير' : 'عضو'}</div>
            </div>
          </div>
          <button className="md:hidden text-[#8696a0] hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rooms */}
        <div className="text-[#8696a0] text-xs px-4 py-2 uppercase tracking-wider">الغرف</div>
        <div className="flex-1 overflow-y-auto">
          {ROOMS.map(r => {
            const roomMsgs = messages.filter(m => m.room === r.id);
            const lastMsg = roomMsgs[roomMsgs.length - 1];
            const unread = room !== r.id ? 0 : 0; // simplified
            return (
              <button key={r.id} onClick={() => { setRoom(r.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-right
                  ${room === r.id ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}>
                <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center text-2xl shrink-0">
                  {r.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm">{r.label}</span>
                    {lastMsg && <span className="text-[#8696a0] text-[11px]">{msgTime(lastMsg.createdAt)}</span>}
                  </div>
                  {lastMsg && (
                    <div className="text-[#8696a0] text-xs truncate mt-0.5">
                      {lastMsg.author.name}: {lastMsg.content}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3 shadow-sm">
          <button className="md:hidden text-[#8696a0] hover:text-white mr-1" onClick={() => setSidebarOpen(true)}>
            <Users className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-[#2a3942] flex items-center justify-center text-xl">
            {roomInfo?.emoji}
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">{roomInfo?.label}</div>
            <div className="text-[#8696a0] text-xs">{members.length} عضو</div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1.5 bg-red-900/30 text-red-400 text-xs px-2.5 py-1 rounded-full">
              <Shield className="w-3 h-3" /> وضع المدير
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundAttachment: 'fixed' }}>

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-60">
              <div className="text-5xl mb-3">{roomInfo?.emoji}</div>
              <p className="text-[#8696a0] text-sm">{roomInfo?.label} — لا توجد رسائل بعد</p>
              <p className="text-[#8696a0] text-xs mt-1">كن أول من يبدأ النقاش!</p>
            </div>
          )}

          {groups.map(group => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="bg-[#182229] text-[#8696a0] text-xs px-3 py-1 rounded-full shadow">
                  {group.date}
                </span>
              </div>
              {group.msgs.map(msg => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isMe={msg.author.id === user?.id}
                  isAdmin={isAdmin}
                  myId={user?.id || ''}
                  allMsgs={messages}
                  onReply={setReplyTo}
                  onDelete={id => del.mutate(id)}
                  onReact={(id, emoji) => react.mutate({ id, emoji })}
                  members={members}
                />
              ))}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="bg-[#202c33] px-4 py-3 space-y-2">
          {/* Reply preview */}
          {replyTo && (
            <div className="flex items-center gap-3 bg-[#2a3942] rounded-xl px-3 py-2">
              <div className="w-0.5 h-8 bg-[#00a884] rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="text-[#00a884] text-xs font-semibold">{replyTo.author.name}</div>
                <div className="text-[#8696a0] text-xs truncate">{replyTo.content}</div>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-[#8696a0] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Targeted users preview */}
          {targetedUsers.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-900/30 rounded-xl px-3 py-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-xs flex-1">
                مرئي لـ: {targetedUsers.map(id => members.find(m => m.id === id)?.name).join('، ')}
              </span>
              <button onClick={() => setTargetedUsers([])} className="text-amber-400 hover:text-amber-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Input row */}
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            {/* Target users button (admin only) */}
            {isAdmin && (
              <div className="relative">
                <button type="button" onClick={() => setShowTargetPicker(s => !s)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${targetedUsers.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-[#2a3942] text-[#8696a0] hover:text-white'}`}
                  title="إظهار لأشخاص محددين">
                  <EyeOff className="w-5 h-5" />
                </button>

                {showTargetPicker && (
                  <div className="absolute bottom-12 left-0 bg-[#233138] rounded-xl shadow-2xl border border-[#3b4a54] w-64 z-50 max-h-64 overflow-y-auto">
                    <div className="px-3 py-2 text-[#8696a0] text-xs border-b border-[#3b4a54]">
                      اختر من يرى الرسالة
                    </div>
                    {members.filter(m => m.id !== user?.id).map(m => (
                      <button key={m.id} type="button"
                        onClick={() => setTargetedUsers(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#2a3942] transition-colors
                          ${targetedUsers.includes(m.id) ? 'text-[#00a884]' : 'text-[#e9edef]'}`}>
                        <Avatar name={m.name} url={m.avatarUrl} size={7} />
                        <div className="flex-1 text-right">
                          <div className="text-sm font-medium">{m.name}</div>
                          {m.specialization && <div className="text-xs text-[#8696a0]">{m.specialization}</div>}
                        </div>
                        {targetedUsers.includes(m.id) && <Check className="w-4 h-4 text-[#00a884]" />}
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t border-[#3b4a54]">
                      <button type="button" onClick={() => setShowTargetPicker(false)}
                        className="w-full text-center text-[#00a884] text-sm font-medium py-1">
                        تأكيد
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Textarea */}
            <div className="flex-1 bg-[#2a3942] rounded-2xl flex items-end">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                placeholder="اكتب رسالة..."
                className="flex-1 bg-transparent text-[#e9edef] placeholder-[#8696a0] resize-none text-sm px-4 py-2.5 focus:outline-none max-h-32 min-h-[44px]"
                style={{ direction: 'rtl' }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px';
                }}
              />
            </div>

            {/* Send */}
            <button type="submit" disabled={!text.trim() || send.isPending}
              className="w-11 h-11 rounded-full bg-[#00a884] flex items-center justify-center hover:bg-[#02c698] transition-all disabled:opacity-50 shadow-md shrink-0">
              <Send className="w-5 h-5 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
