'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Preencha todos os campos.'); return; }

    setLoading(true);
    setError('');

    try {
      // login() from AuthContext: calls /auth/login (JSON), stores token in memory,
      // receives the HttpOnly cookie automatically, then fetches /users/me.
      await login(form);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-inho-black grid-bg flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-inho-gold/6 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-inho-green/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 glassmorphism rounded-full px-5 py-2.5 mb-6 hover:border-inho-gold/40 transition-all">
            <div className="w-2 h-2 bg-inho-green rounded-full animate-pulse" />
            <span className="font-mono text-xs text-inho-muted uppercase tracking-widest">INHO · Plataforma</span>
          </Link>
          <h1 className="text-4xl font-black text-inho-text mb-2">
            Bem-vindo de <span className="text-shimmer">volta</span>
          </h1>
          <p className="text-inho-muted text-sm">Acesse sua conta com segurança</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="glassmorphism rounded-3xl p-8 border border-inho-gold/10 hover:border-inho-gold/20 transition-all duration-500 animate-slide-up"
          noValidate
        >
          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-2 mb-5">
            <label htmlFor="login-email" className="text-inho-muted text-xs font-mono uppercase tracking-widest">
              E-mail
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-inho-muted pointer-events-none" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full bg-inho-dark/50 border border-inho-border rounded-xl pl-11 pr-4 py-3.5 text-inho-text text-sm placeholder:text-inho-muted/50 focus:outline-none focus:border-inho-gold/50 focus:bg-inho-dark transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2 mb-8">
            <label htmlFor="login-password" className="text-inho-muted text-xs font-mono uppercase tracking-widest">
              Senha
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-inho-muted pointer-events-none" />
              <input
                id="login-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-inho-dark/50 border border-inho-border rounded-xl pl-11 pr-12 py-3.5 text-inho-text text-sm placeholder:text-inho-muted/50 focus:outline-none focus:border-inho-gold/50 focus:bg-inho-dark transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-inho-muted hover:text-inho-text transition-colors"
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full group flex items-center justify-center gap-3 px-8 py-4 bg-inho-gold-gradient text-inho-black font-black text-sm rounded-2xl hover:shadow-inho-gold hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-inho-black/40 border-t-inho-black rounded-full animate-spin" />
                Autenticando...
              </>
            ) : (
              <>
                Entrar na plataforma
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Footer links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-inho-muted text-sm">
              Não tem uma conta?{' '}
              <Link href="/register" id="login-goto-register" className="text-inho-gold hover:underline font-semibold">
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </form>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-inho-muted text-xs animate-fade-in">
          <ShieldCheck size={12} className="text-inho-green" />
          <span className="font-mono">Conexão criptografada · JWT + RBAC · Auditoria ativa</span>
        </div>
      </div>
    </div>
  );
}
