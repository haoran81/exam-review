import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

export function OfflineBanner() {
  const isOnline = useUIStore(s => s.isOnline);
  const setOnline = useUIStore(s => s.setOnline);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [setOnline]);

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-center text-sm py-1.5 px-4 font-medium">
      📡 当前离线 — 已缓存的内容仍可使用
    </div>
  );
}
