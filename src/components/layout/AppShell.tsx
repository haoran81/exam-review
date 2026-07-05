import type { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from './OfflineBanner';
import { InstallPrompt } from './InstallPrompt';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <OfflineBanner />
      <InstallPrompt />
      <main className="pb-20 max-w-2xl mx-auto px-4 py-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
