import { create } from 'zustand';

interface UIState {
  isOnline: boolean;
  setOnline: (val: boolean) => void;

  showInstallPrompt: boolean;
  setShowInstallPrompt: (val: boolean) => void;

  deferredPrompt: BeforeInstallPromptEvent | null;
  setDeferredPrompt: (evt: BeforeInstallPromptEvent | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOnline: navigator.onLine,
  setOnline: (val) => set({ isOnline: val }),

  showInstallPrompt: false,
  setShowInstallPrompt: (val) => set({ showInstallPrompt: val }),

  deferredPrompt: null,
  setDeferredPrompt: (evt) => set({ deferredPrompt: evt }),
}));
