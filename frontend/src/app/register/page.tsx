'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api';

const requirements = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Número', test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!requirements.every(r => r.test(form.password))) {
      setError('A senha não atende aos requisitos mínimos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-inho-black grid-bg flex items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-inho-green/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-inho-gold/6 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 glassmorphism rounded-full px-5 py-2.5 mb-6 hover:border-inho-gold/40 transition-all">
            <div className="w-2 h-2 bg-inho-gold rounded-full animate-pulse" />
            <span className="font-mono text-xs text-inho-muted uppercase tracking-widest">INHO · Nova Conta</span>
          </Link>
          <h1 className="text-4xl font-black text-inho-text mb-2">
            Crie sua <span className="text-shimmer">conta</span>
          </h1>
          <p className="text-inho-muted text-sm">Gratuito · Sem cartão de crédito</p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="glassmorphism rounded-3xl p-10 border border-inho-green/30 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-inho-green/10 border border-inho-green/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-inho-green" />
            </div>
            <h2 className="text-inho-text font-bold text-xl mb-2">Conta criada!</h2>
            <p className="text-inho-muted text-sm">Redirecionando para o login...</p>
          </div>
        ) : (
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

            {/* Full Name */}
            <div className="flex flex-col gap-2 mb-5">
              <label htmlFor="reg-name" className="text-inho-muted text-xs font-mono uppercase tracking-widest">Nome completo</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-inho-muted pointer-events-none" />
                <input
                  id="reg-name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className="w-full bg-inho-dark/50 border border-inho-border rounded-xl pl-11 pr-4 py-3.5 text-inho-text text-sm placeholder:text-inho-muted/50 focus:outline-none focus:border-inho-gold/50 focus:bg-inho-dark transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2 mb-5">
              <label htmlFor="reg-email" className="text-inho-muted text-xs font-mono uppercase tracking-widest">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-inho-muted pointer-events-none" />
                <input
                  id="reg-email"
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
            <div className="flex flex-col gap-2 mb-3">
              <label htmlFor="reg-password" className="text-inho-muted text-xs font-mono uppercase tracking-widest">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-inho-muted pointer-events-none" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-inho-dark/50 border border-inho-border rounded-xl pl-11 pr-12 py-3.5 text-inho-text text-sm placeholder:text-inho-muted/50 focus:outline-none focus:border-inho-gold/50 focus:bg-inho-dark transition-all"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-inho-muted hover:text-inho-text transition-colors"
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            {form.password && (
              <div className="flex gap-3 flex-wrap mb-5">
                {requirements.map(r => (
                  <span key={r.label} className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${r.test(form.password) ? 'text-inho-green' : 'text-inho-muted'}`}>
                    <CheckCircle2 size={11} />
                    {r.label}
                  </span>
                ))}
              </div>
            )}

            {/* Confirm */}
            <div className="flex flex-col gap-2 mb-8">
              <label htmlFor="reg-confirm" className="text-inho-muted text-xs font-mono uppercase tracking-widest">Confirmar senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-inho-muted pointer-events-none" />
                <input
                  id="reg-confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-inho-dark/50 border rounded-xl pl-11 pr-12 py-3.5 text-inho-text text-sm placeholder:text-inho-muted/50 focus:outline-none focus:bg-inho-dark transition-all ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-500/40 focus:border-red-500/60'
                      : 'border-inho-border focus:border-inho-gold/50'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-inho-muted hover:text-inho-text transition-colors"
                  aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-3 px-8 py-4 bg-inho-gold-gradient text-inho-black font-black text-sm rounded-2xl hover:shadow-inho-gold hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-inho-black/40 border-t-inho-black rounded-full animate-spin" />Criando conta...</>
              ) : (
                <>Criar conta gratuita<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <p className="mt-6 text-center text-inho-muted text-sm">
              Já tem conta?{' '}
              <Link href="/login" id="register-goto-login" className="text-inho-gold hover:underline font-semibold">
                Fazer login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
