'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { auditApi } from '@/lib/api';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await auditApi.listMyLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-inho-green';
      case 'DELETE': return 'text-red-400';
      case 'LOGIN': return 'text-inho-blue';
      case 'FAILED_LOGIN': return 'text-red-400';
      default: return 'text-inho-muted';
    }
  };

  return (
    <div className="min-h-screen bg-inho-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-inho-muted hover:text-inho-text transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-inho-text">Log de Auditoria</h1>
            <Shield size={20} className="text-inho-gold" />
          </div>
        </div>

        <div className="glassmorphism rounded-2xl border border-inho-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-inho-text">
              <thead className="bg-inho-dark/50 border-b border-inho-border text-inho-muted font-mono text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-normal">Timestamp</th>
                  <th className="px-6 py-4 font-normal">Ação</th>
                  <th className="px-6 py-4 font-normal">Entidade</th>
                  <th className="px-6 py-4 font-normal">IP Address</th>
                  <th className="px-6 py-4 font-normal">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <div className="w-6 h-6 border-2 border-inho-gold border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-inho-muted">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-inho-border/50 hover:bg-inho-dark/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-inho-muted whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 font-mono font-bold text-xs ${getActionColor(log.action)}`}>
                        {log.action}
                      </td>
                      <td className="px-6 py-4">
                        {log.entity}
                        {log.entity_id && <span className="block text-[10px] text-inho-muted mt-1 break-all">{log.entity_id}</span>}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-inho-muted">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono break-all max-w-xs overflow-hidden text-ellipsis text-inho-muted">
                        {log.detail || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
