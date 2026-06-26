import { useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './useAuth';

export function useScreenshotDetect(room: string, enabled = true) {
  const { user } = useAuth();

  const report = useCallback(async () => {
    if (!user) return;
    try {
      await api.post('/chat/screenshot', { room });
    } catch {}
  }, [room, user]);

  useEffect(() => {
    if (!enabled || !user) return;

    // PrintScreen key
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        report();
      }
    };

    // Mac shortcuts: Cmd+Shift+3/4/5
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5', 's', 'S'].includes(e.key)) {
        report();
      }
    };

    // Screen capture API detection
    const onVisibilityChange = () => {
      // Heuristic: if page goes hidden very briefly it might be a screenshot tool
    };

    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, user, report]);
}
