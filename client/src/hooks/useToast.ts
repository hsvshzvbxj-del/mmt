import { useState, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];
let nextId = 1;

function notify() {
  listeners.forEach(fn => fn([...toasts]));
}

export function toast(message: string, type: Toast['type'] = 'success') {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }, 4000);
}

export function useToastState() {
  const [state, setState] = useState<Toast[]>([]);
  
  const subscribe = useCallback(() => {
    const fn = (t: Toast[]) => setState(t);
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }, []);

  return { toasts: state, subscribe };
}
