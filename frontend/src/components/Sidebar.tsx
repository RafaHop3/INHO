'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3, FileSignature, ShoppingCart, Monitor, ShieldCheck,
  ChevronDown, ChevronRight, LogOut, User, Users, FileText,
  X, Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();  // ← AuthContext, not localStorage

  const [orgOpen, setOrgOpen] = useState(true);
  const [sysOpen, setSysOpen] = useState(true);

  const handleLogout = async () => {
    await logout();          // clears memory token + HttpOnly cookie
    router.replace('/login');
  };

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // ── RBAC helpers ─────────────────────────────────────────────────
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const roleColor: Record<string, string> = {
    super_admin: 'text-inho-gold border-inho-gold/30 bg-inho-gold/10',
    admin: 'text-inho-blue border-inho-blue/30 bg-inho-blue/10',
    operator: 'text-inho-green border-inho-green/30 bg-inho-green/10',
    viewer: 'text-inho-muted border-inho-border bg-inho-dark/50',
    client: 'text-inho-text border-inho-border bg-inho-dark/50',
  };

  const navContent = (
    <div className="flex flex-col h-full bg-inho-dark border-r border-inho-border font-mono text-xs">
      {/* Brand Header */}
      <div className="p-6 border-b border-inho-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="w-6 h-6 rounded-lg bg-inho-gold-gradient flex items-center justify-center shadow-inho-gold">
            <span className="font-black text-inho-black text-xs font-sans">I</span>
          </div>
          <span className="font-bold text-sm text-inho-text tracking-widest">INHO</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-inho-green rounded-full animate-pulse" />
          <span className="text-[10px] text-inho-muted">Online</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Visão Geral */}
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isLinkActive('/dashboard')
              ? 'bg-inho-gold/10 text-inho-gold border border-inho-gold/20'
              : 'text-inho-muted hover:text-inho-text hover:bg-white/5 border border-transparent'
            }`}
        >
          <BarChart3 size={16} />
          <span className="font-bold uppercase tracking-wider">Visão Geral</span>
        </Link>

        {/* ORGANIZAÇÃO */}
        <div className="space-y-1">
          <button
            onClick={() => setOrgOpen(!orgOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-purple-400 hover:bg-purple-500/5 rounded-lg transition-colors font-bold uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <span className="w-1 h-3 bg-purple-500 rounded-full" />
              👥 Organização
            </span>
            {orgOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {orgOpen && (
            <div className="pl-4 space-y-0.5 border-l border-purple-500/10 ml-3.5 mt-1">
              {[
                { label: 'Contratos', href: '/dashboard/contracts', icon: FileSignature },
                { label: 'Pedidos de Venda', href: '/dashboard/sales-orders', icon: ShoppingCart },
                { label: 'Frente de Caixa (PDV)', href: '/dashboard/pdv', icon: Monitor },
                { label: 'Pesquisa de Clima', href: '/dashboard/pco', icon: Users },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${isLinkActive(item.href)
                      ? 'bg-purple-500/10 text-purple-400 font-bold'
                      : 'text-inho-muted hover:text-inho-text hover:bg-white/5'
                    }`}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ⚙️ SISTEMA — only visible to admin/super_admin (RBAC gate) */}
        {isAdmin && (
          <div className="space-y-1">
            <button
              onClick={() => setSysOpen(!sysOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-inho-green hover:bg-inho-green/5 rounded-lg transition-colors font-bold uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <span className="w-1 h-3 bg-inho-green rounded-full" />
                ⚙️ Sistema
              </span>
              {sysOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {sysOpen && (
              <div className="pl-4 space-y-0.5 border-l border-inho-green/10 ml-3.5 mt-1">
                {[
                  { label: 'Auditoria', href: '/dashboard/audit', icon: ShieldCheck },
                  { label: 'Usuários', href: '/admin/users', icon: Users },
                  { label: 'Configurações', href: '/admin/settings', icon: Settings },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${isLinkActive(item.href)
                        ? 'bg-inho-green/10 text-inho-green font-bold'
                        : 'text-inho-muted hover:text-inho-text hover:bg-white/5'
                      }`}
                  >
                    <item.icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-inho-muted hover:text-inho-text hover:bg-white/5 transition-colors"
                >
                  <FileText size={14} />
                  <span>Swagger API Docs</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Session Footer */}
      {user && (
        <div className="p-4 border-t border-inho-border space-y-3 bg-inho-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-inho-gold/10 border border-inho-gold/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-inho-gold" />
            </div>
            <div className="min-w-0 flex-1">
              {/* Now shows the real full_name from /users/me → AuthContext */}
              <p className="text-inho-text font-bold truncate">{user.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-widest ${roleColor[user.role] ?? roleColor.client}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-inho-dark border border-inho-border hover:border-red-500/50 hover:text-red-400 text-inho-muted py-2 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider"
          >
            <LogOut size={12} />
            Sair da Conta
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-inho-dark animate-slide-right">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-inho-muted hover:text-inho-text"
            >
              <X size={18} />
            </button>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
