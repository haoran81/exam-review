import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

export function InstallPrompt() {
  const showPrompt = useUIStore(s => s.showInstallPrompt);
  const setShowPrompt = useUIStore(s => s.setShowInstallPrompt);
  const deferredPrompt = useUIStore(s => s.deferredPrompt);
  const setDeferredPrompt = useUIStore(s => s.setDeferredPrompt);

  useEffect(() => {
    // Android/Desktop: 监听 beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: 两秒后仍无 install 事件就显示手动引导（iOS 不支持 beforeinstallprompt）
    const timer = isIOS ? setTimeout(() => setShowPrompt(true), 2000) : null;

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (timer) clearTimeout(timer);
    };
  }, [setDeferredPrompt, setShowPrompt]);

  if (!showPrompt) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-indigo-800 font-medium">
          {isIOS
            ? '📱 点击分享按钮 → 添加到主屏幕'
            : '💡 添加到主屏幕，像 App 一样使用'}
        </p>
        <div className="flex gap-2 shrink-0">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 min-h-[36px]"
            >
              安装
            </button>
          )}
          <button
            onClick={() => setShowPrompt(false)}
            className="px-3 py-1.5 text-indigo-500 text-sm font-medium hover:text-indigo-700 min-h-[36px]"
          >
            忽略
          </button>
        </div>
      </div>
    </div>
  );
}
