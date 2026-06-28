import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Participant {
  id: string; name: string; avatarUrl?: string; specialization?: string; isOnline?: boolean;
}
interface Conversation {
  id: string; participant: Participant | null; lastMessage?: string; lastMessageAt?: string;
  unreadCount: number; isArchived: boolean;
}
interface Message {
  _id: string; senderId: { _id: string; name: string; avatarUrl?: string } | string;
  content: string; createdAt: string; status: string; replyToId?: string;
}

function Avatar({ name, url, size = 10 }: { name: string; url?: string; size?: number }) {
  const initials = name?.split(' ').map(p => p[0]).slice(0, 2).join('') || '?';
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-rose-500', 'bg-amber-500'];
  const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-gray-400';
  if (url) return <img src={url} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />;
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} text-white flex items-center justify-center text-sm font-bold`}>
      {initials}
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [tab, setTab] = useState<'all' | 'archived'>('all');
  const [pollTs, setPollTs] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    const res = await api.get(`/messages/conversations/${convId}/messages`);
    setMessages(res.data);
    setPollTs(new Date().toISOString());
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!activeConvId) return;
    loadMessages(activeConvId);
  }, [activeConvId, loadMessages]);

  useEffect(() => {
    if (!activeConvId || !pollTs) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/messages/conversations/${activeConvId}/messages?before=`);
        setMessages(res.data);
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConvId, pollTs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function searchForUsers(q: string) {
    setSearchUsers(q);
    if (q.length < 1) { setUserResults([]); return; }
    try {
      const res = await api.get(`/messages/users/search?q=${encodeURIComponent(q)}`);
      setUserResults(res.data);
    } catch {}
  }

  async function startConversation(recipientId: string) {
    try {
      const res = await api.post('/messages/conversations', { recipientId });
      setShowNewChat(false);
      setSearchUsers('');
      setUserResults([]);
      await loadConversations();
      setActiveConvId(res.data.conversationId);
    } catch {}
  }

  async function sendMessage() {
    if (!newMsg.trim() || !activeConvId || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/messages/conversations/${activeConvId}/messages`, { content: newMsg.trim() });
      setMessages(prev => [...prev, res.data]);
      setNewMsg('');
      loadConversations();
    } finally {
      setSending(false);
    }
  }

  async function archiveConv(convId: string) {
    await api.put(`/messages/conversations/${convId}/archive`, {});
    loadConversations();
  }

  async function deleteConv(convId: string) {
    await api.delete(`/messages/conversations/${convId}`);
    if (activeConvId === convId) setActiveConvId(null);
    loadConversations();
  }

  const visibleConvs = conversations.filter(c =>
    tab === 'archived' ? c.isArchived : !c.isArchived
  );
  const activeConv = conversations.find(c => c.id === activeConvId);

  function getSenderId(msg: Message): string {
    if (typeof msg.senderId === 'string') return msg.senderId;
    return (msg.senderId as any)._id;
  }

  function getSenderName(msg: Message): string {
    if (typeof msg.senderId === 'object') return (msg.senderId as any).name;
    return '';
  }

  function getSenderAvatar(msg: Message): string | undefined {
    if (typeof msg.senderId === 'object') return (msg.senderId as any).avatarUrl;
    return undefined;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full sm:w-80 bg-white border-l border-gray-100 flex flex-col shrink-0"
        style={{ display: activeConvId ? 'none' : 'flex' }} id="conv-sidebar">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-primary">الرسائل</h1>
            <button onClick={() => setShowNewChat(true)}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-lg hover:bg-primary/90">
              +
            </button>
          </div>
          <div className="flex gap-2">
            {(['all', 'archived'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {t === 'all' ? 'الكل' : 'المؤرشفة'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
          ) : visibleConvs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm">{tab === 'all' ? 'لا توجد محادثات بعد' : 'لا توجد محادثات مؤرشفة'}</p>
              {tab === 'all' && (
                <button onClick={() => setShowNewChat(true)} className="mt-3 text-primary text-sm underline">
                  ابدأ محادثة جديدة
                </button>
              )}
            </div>
          ) : (
            visibleConvs.map(conv => (
              <div key={conv.id}
                onClick={() => { setActiveConvId(conv.id); document.getElementById('conv-sidebar')!.style.display = 'none'; }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 transition-colors ${activeConvId === conv.id ? 'bg-primary/5' : ''}`}>
                <div className="relative">
                  <Avatar name={conv.participant?.name || '?'} url={conv.participant?.avatarUrl} size={10} />
                  {conv.participant?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-gray-900 truncate">{conv.participant?.name}</p>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-gray-400 shrink-0 mr-2">
                        {formatDistanceToNow(new Date(conv.lastMessageAt), { locale: ar, addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage || 'ابدأ المحادثة'}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 mr-2">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!activeConvId ? 'hidden sm:flex' : 'flex'}`}>
        {!activeConvId ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">اختر محادثة</h2>
              <p className="text-gray-400 text-sm">اختر محادثة من القائمة أو ابدأ محادثة جديدة</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
              <button onClick={() => { setActiveConvId(null); document.getElementById('conv-sidebar')!.style.display = 'flex'; }}
                className="sm:hidden text-gray-400 hover:text-gray-600 text-xl">←</button>
              <Avatar name={activeConv?.participant?.name || '?'} url={activeConv?.participant?.avatarUrl} size={10} />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{activeConv?.participant?.name}</p>
                <p className="text-xs text-gray-400">{activeConv?.participant?.specialization || ''}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => archiveConv(activeConvId)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200">
                  أرشفة
                </button>
                <button onClick={() => deleteConv(activeConvId)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded border border-red-100">
                  حذف
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMe = getSenderId(msg) === user?.id;
                return (
                  <div key={msg._id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && <Avatar name={getSenderName(msg)} url={getSenderAvatar(msg)} size={8} />}
                    <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-white/60 text-left' : 'text-gray-400 text-right'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                        {isMe && msg.status === 'read' && ' ✓✓'}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="اكتب رسالتك..."
                  rows={1}
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMsg.trim() || sending}
                  className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0">
                  {sending ? '...' : '↑'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">محادثة جديدة</h3>
              <button onClick={() => { setShowNewChat(false); setSearchUsers(''); setUserResults([]); }}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <input
              value={searchUsers}
              onChange={e => searchForUsers(e.target.value)}
              placeholder="ابحث عن عضو..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary mb-3"
              autoFocus
            />
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {userResults.map((u: any) => (
                <button key={u._id} onClick={() => startConversation(u._id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <Avatar name={u.name} url={u.avatarUrl} size={9} />
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.specialization}</p>
                  </div>
                </button>
              ))}
              {searchUsers && userResults.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">لا توجد نتائج</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
