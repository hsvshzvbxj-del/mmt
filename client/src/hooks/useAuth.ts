import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  avatar_url?: string;
  onboarding?: {
    completed: boolean;
    step: number;
  };
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set) => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isAuthenticated: !!storedToken,

    login: async (email: string, password: string) => {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false });
    },

    setUser: (user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    },
  };
});
