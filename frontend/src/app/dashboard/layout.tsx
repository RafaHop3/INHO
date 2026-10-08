'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Only redirect after AuthContext has finished the silent refresh attempt.
    // Without this guard, a hard-reload would immediately redirect to /login
    // before the refresh token exchange completes.
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  // Show spinner while session rehydration is in progress
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-inho-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-inho-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-inho-black text-inho-text">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-inho-dark border-b border-inho-border sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-inho-gold-gradient flex items-center justify-center">
              <span className="font-black text-inho-black text-[10px]">I</span>
            </div>
            <span className="font-mono text-xs font-bold text-inho-text tracking-widest">INHO</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-inho-muted hover:text-inho-text bg-white/5 rounded-lg border border-inho-border"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
        </header>

        {/* Scrollable Page Wrapper */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

