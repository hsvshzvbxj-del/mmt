import { create } from 'zustand';
import api from '../lib/api';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  icon?: string;
  isRead: boolean;
  readAt?: string;
  triggeredBy?: { _id: string; name: string; avatarUrl?: string };
  resourceId?: string;
  resourceType?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  fetch: () => Promise<void>;
  pollUnread: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useNotifications = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  panelOpen: false,

  openPanel: () => {
    set({ panelOpen: true });
    get().fetch();
  },
  closePanel: () => set({ panelOpen: false }),
  togglePanel: () => {
    const open = !get().panelOpen;
    set({ panelOpen: open });
    if (open) get().fetch();
  },

  fetch: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/notifications?limit=40');
      set({ notifications: res.data.notifications, unreadCount: res.data.unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  pollUnread: async () => {
    try {
      const res = await api.get('/notifications?unread=true&limit=1');
      set({ unreadCount: res.data.unreadCount });
    } catch {}
  },

  markRead: async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set(state => ({
        notifications: state.notifications.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  remove: async (id: string) => {
    const notif = get().notifications.find(n => n._id === id);
    try {
      await api.delete(`/notifications/${id}`);
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount: notif && !notif.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }));
    } catch {}
  },

  clearAll: async () => {
    try {
      await api.delete('/notifications');
      set({ notifications: [], unreadCount: 0 });
    } catch {}
  },
}));
