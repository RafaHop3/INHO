'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users, DollarSign, Activity, FileText, ArrowUpRight, ArrowDownRight,
  Map, Monitor, PieChart as PieChartIcon, Search, Bell, Settings,
  Building2, Users2, Database
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import Counter from '@/components/Counter';

// API Imports
import { contractsApi, salesOrdersApi, pdvApi } from '@/lib/api';
import type { ContractOut } from '@/types/contracts';
import type { SalesOrderOut } from '@/types/sales';
import type { PDVSaleOut } from '@/types/pdv';

export default function DashboardClient() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Data States
  const [contracts, setContracts] = useState<ContractOut[]>([]);
  const [sales, setSales] = useState<SalesOrderOut[]>([]);
  const [pdvSales, setPdvSales] = useState<PDVSaleOut[]>([]);

  // Carregar todos os blocos do ERP simultaneamente (Promise.allSettled)
  useEffect(() => {
    let active = true;

    const fetchAllData = async () => {
      try {
        // Fetch Contracts and Sales Orders
        const [contractsRes, salesRes] = await Promise.allSettled([
          contractsApi.list(),
          salesOrdersApi.list()
        ]);

        let loadedContracts: ContractOut[] = [];
        let loadedSales: SalesOrderOut[] = [];

        if (contractsRes.status === 'fulfilled') loadedContracts = contractsRes.value;
        if (salesRes.status === 'fulfilled') loadedSales = salesRes.value;

        // Fetch PDV Data (Requires an active session check first)
        let loadedPdvSales: PDVSaleOut[] = [];
        try {
          const session = await pdvApi.getSession();
          if (session && session.id) {
            loadedPdvSales = await pdvApi.listSales(session.id);
          }
        } catch (e) {
          // Ignore if no session is open
        }

        if (active) {
          setContracts(loadedContracts);
          setSales(loadedSales);
          setPdvSales(loadedPdvSales);
        }
      } catch (err: any) {
        if (active) setErrorMsg('Erro ao sincronizar módulos.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAllData();
    return () => { active = false; };
  }, []);

  // ── Metrics Calculators (Memoized) ──

  // Recorrente: Contratos ATIVOS do tipo RECEIVABLE
  const mrrTotal = useMemo(() => {
    return contracts
      .filter(c => c.status === 'ACTIVE' && c.record_type === 'RECEIVABLE')
      .reduce((acc, c) => acc + Number(c.total_value), 0);
  }, [contracts]);

  // Faturamento: Pedidos FATURADOS
  const salesNet = useMemo(() => {
    return sales
      .filter(s => s.status === 'INVOICED')
      .reduce((acc, s) => acc + Number(s.amount), 0);
  }, [sales]);

  // Volume PDV: Vendas da sessão atual (Frente Caixa)
  const pdvVolume = useMemo(() => {
    return pdvSales
      .reduce((acc, sale) => acc + Number(sale.total_amount), 0);
  }, [pdvSales]);

  // The final Total Cash Balance generated across operations
  const netEarnings = mrrTotal + salesNet + pdvVolume;
  const earningsTarget = 150000;
  const progressPercent = Math.min((netEarnings / earningsTarget) * 100, 100);

  // Mock Graph Data generated off of total sums just for visual showcase
  const financialData = useMemo(() => [
    { name: 'Seg', balance: netEarnings * 0.3 },
    { name: 'Ter', balance: netEarnings * 0.4 },
    { name: 'Qua', balance: netEarnings * 0.6 },
    { name: 'Qui', balance: netEarnings * 0.75 },
    { name: 'Sex', balance: netEarnings * 0.9 },
    { name: 'Sáb', balance: netEarnings },
    { name: 'Dom', balance: netEarnings + 850 },
  ], [netEarnings]);


  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 h-[calc(100vh-4rem)]">
        <div className="w-12 h-12 border-4 border-inho-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-inho-muted text-sm animate-pulse tracking-widest uppercase">
          Sincronizando Módulos...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Search Bar Top */}
      <header className="sticky top-0 z-10 glassmorphism border-b border-inho-border px-8 py-4 flex items-center justify-between">
        <div className="relative w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-inho-muted" />
          <input
            type="text"
            placeholder="Pesquisar métricas..."
            className="w-full bg-inho-dark/50 border border-inho-border rounded-xl pl-10 pr-4 py-2 text-sm text-inho-text focus:outline-none focus:border-inho-blue/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-inho-muted hover:text-inho-text transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-inho-gold rounded-full" />
          </button>
          <div className="w-px h-6 bg-inho-border" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-inho-blue to-inho-green p-[1px]">
              <div className="w-full h-full bg-inho-dark rounded-lg flex items-center justify-center text-xs font-bold">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-inho-text leading-tight">{user?.full_name}</p>
              <p className="text-[10px] font-mono text-inho-muted">ORBE SYSTEMS</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 fade-in">

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-inho-text mb-2">Painel <span className="text-inho-blue">Estratégico</span></h1>
            <p className="text-inho-muted text-sm max-w-xl leading-relaxed">
              Resumo de operações em tempo real. Os dados abaixo são reduzidos nativamente a partir dos módulos Seguros de Contratos e PDV.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-inho-dark border border-inho-border rounded-xl text-sm font-bold text-inho-muted hover:text-inho-text hover:border-inho-blue/50 transition-all">
              <Settings size={16} /> Ajustes
            </button>
            <Link href="/dashboard/pdv" className="flex items-center gap-2 px-5 py-2.5 bg-inho-blue text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-blue-400 hover:shadow-lg shadow-inho-blue/20 transition-all">
              <Monitor size={16} /> Abrir PDV
            </Link>
          </div>
        </div>

        {/* --- KPI Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          {/* Card 1: Receita Contratos */}
          <div className="glassmorphism p-6 flex flex-col rounded-3xl border border-inho-border relative overflow-hidden group hover:border-inho-green/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-inho-green/10 border border-inho-green/20 flex items-center justify-center text-inho-green">
                <DollarSign size={20} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-inho-green bg-inho-green/10 px-2 py-1 rounded-full border border-inho-green/20">
                <ArrowUpRight size={12} /> MRR
              </span>
            </div>
            <p className="text-inho-muted text-xs font-mono uppercase tracking-widest mb-1">Contratos Recorrentes</p>
            <h3 className="text-3xl font-black text-inho-text font-mono">
              <Counter end={mrrTotal} decimals={2} prefix="R$ " />
            </h3>
            <div className="absolute -bottom-6 -right-6 text-inho-green/5 group-hover:text-inho-green/10 transition-colors">
              <Database size={100} />
            </div>
          </div>

          {/* Card 2: Pedidos Faturados */}
          <div className="glassmorphism p-6 flex flex-col rounded-3xl border border-inho-border relative overflow-hidden group hover:border-inho-blue/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-inho-blue/10 border border-inho-blue/20 flex items-center justify-center text-inho-blue">
                <FileText size={20} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-inho-blue bg-inho-blue/10 px-2 py-1 rounded-full border border-inho-blue/20">
                <ArrowUpRight size={12} /> B2B
              </span>
            </div>
            <p className="text-inho-muted text-xs font-mono uppercase tracking-widest mb-1">Pedidos Faturados</p>
            <h3 className="text-3xl font-black text-inho-text font-mono">
              <Counter end={salesNet} decimals={2} prefix="R$ " />
            </h3>
            <div className="absolute -bottom-6 -right-6 text-inho-blue/5 group-hover:text-inho-blue/10 transition-colors">
              <Building2 size={100} />
            </div>
          </div>

          {/* Card 3: Frente de Caixa */}
          <div className="glassmorphism p-6 flex flex-col rounded-3xl border border-inho-border relative overflow-hidden group hover:border-inho-gold/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-inho-gold/10 border border-inho-gold/20 flex items-center justify-center text-inho-gold">
                <Monitor size={20} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-inho-gold bg-inho-gold/10 px-2 py-1 rounded-full border border-inho-gold/20">
                <Activity size={12} /> B2C
              </span>
            </div>
            <p className="text-inho-muted text-xs font-mono uppercase tracking-widest mb-1">Caixa Físico Atual</p>
            <h3 className="text-3xl font-black text-inho-text font-mono">
              <Counter end={pdvVolume} decimals={2} prefix="R$ " />
            </h3>
            <div className="absolute -bottom-6 -right-6 text-inho-gold/5 group-hover:text-inho-gold/10 transition-colors">
              <Users2 size={100} />
            </div>
          </div>

          {/* Card 4: Alvo de Conversão */}
          <div className="glassmorphism p-6 flex flex-col justify-between rounded-3xl border border-inho-border bg-gradient-to-br from-inho-dark to-inho-black overflow-hidden relative">
            <div>
              <p className="text-inho-muted text-xs font-mono uppercase tracking-widest mb-1">Alvo Mensal (Target)</p>
              <h3 className="text-2xl font-black text-inho-text mb-2">
                {progressPercent.toFixed(1)}% <span className="text-sm font-medium text-inho-muted">Concluído</span>
              </h3>
            </div>

            <div className="w-full bg-inho-dark border border-inho-border rounded-full h-3 mt-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-inho-gold via-inho-green to-inho-blue relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

        </div>

        {/* --- Main Chart & Analytics --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 glassmorphism rounded-3xl border border-inho-border p-6 lg:p-8 relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-inho-blue/5 to-transparent pointer-events-none" />

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-black text-inho-text">Crescimento Unificado</h3>
                <p className="text-xs text-inho-muted font-mono mt-1">Evolução Combinada dos 3 Canais</p>
              </div>
              <div className="flex gap-2">
                {['7D', '15D', '30D', 'YTD'].map((t, i) => (
                  <button key={t} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${i === 0 ? 'bg-inho-blue/20 text-inho-blue border border-inho-blue/30' : 'bg-inho-dark text-inho-muted border border-inho-border hover:text-inho-text'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[320px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'monospace' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid #1e2d40', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                    labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita Unificada']}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEarnings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glassmorphism rounded-3xl border border-inho-border p-6 flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-black text-inho-text flex items-center gap-3">
                <PieChartIcon size={20} className="text-inho-gold" /> Composição
              </h3>
              <p className="text-xs text-inho-muted font-mono mt-1">Market Share Operacional</p>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="space-y-4">
                {/* MRR Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-inho-text">Contratos B2B</span>
                    <span className="font-mono text-inho-green font-bold">{(mrrTotal / Math.max(1, netEarnings) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-inho-dark rounded-full h-2">
                    <div className="bg-inho-green h-2 rounded-full" style={{ width: `${(mrrTotal / Math.max(1, netEarnings) * 100)}%` }} />
                  </div>
                </div>

                {/* Faturamento Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-inho-text">Vendas Isoladas</span>
                    <span className="font-mono text-inho-blue font-bold">{(salesNet / Math.max(1, netEarnings) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-inho-dark rounded-full h-2">
                    <div className="bg-inho-blue h-2 rounded-full" style={{ width: `${(salesNet / Math.max(1, netEarnings) * 100)}%` }} />
                  </div>
                </div>

                {/* PDV Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-inho-text">Frente Caixa B2C</span>
                    <span className="font-mono text-inho-gold font-bold">{(pdvVolume / Math.max(1, netEarnings) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-inho-dark rounded-full h-2">
                    <div className="bg-inho-gold h-2 rounded-full" style={{ width: `${(pdvVolume / Math.max(1, netEarnings) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto p-4 bg-inho-dark border border-inho-border rounded-xl">
              <p className="text-xs text-inho-muted mb-2 font-mono uppercase">Info do Relatório</p>
              <p className="text-sm font-bold text-inho-text flex items-center justify-between">
                Status Serverless
                <span className="w-2 h-2 rounded-full bg-inho-green animate-pulse" />
              </p>
              <p className="text-[10px] text-inho-muted font-mono mt-1">Calculado em Client-Side (reduce) ⚡</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
