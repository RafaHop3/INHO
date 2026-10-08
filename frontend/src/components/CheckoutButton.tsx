'use client';

import { useState } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

interface CheckoutButtonProps {
    /** Email do usuário autenticado */
    userEmail: string;
    userName?: string;
    /** price_id do Stripe (usa o padrão da env se omitido) */
    priceId?: string;
    /** URL de retorno após sucesso */
    successUrl?: string;
    /** URL de retorno após cancelamento */
    cancelUrl?: string;
    /** Texto do botão */
    label?: string;
    /** Classes adicionais */
    className?: string;
}

/**
 * Dispara um Stripe Checkout Session via API INHO e redireciona
 * o usuário para a URL de pagamento retornada.
 */
export default function CheckoutButton({
    userEmail,
    userName = '',
    priceId,
    successUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/pagamento/sucesso`,
    cancelUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/pagamento/cancelado`,
    label = 'Assinar / Pagar',
    className = '',
}: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${apiBase}/api/v1/payments/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    user_email: userEmail,
                    user_name: userName,
                    ...(priceId ? { price_id: priceId } : {}),
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.detail ?? `Erro ${res.status}`);
            }

            const { url } = await res.json();
            if (!url) throw new Error('URL de pagamento não recebida.');

            window.location.href = url;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro desconhecido.';
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-start gap-2">
            <button
                id="checkout-btn"
                onClick={handleCheckout}
                disabled={loading}
                className={[
                    'flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300',
                    'bg-gradient-to-r from-yellow-500 to-amber-400 text-black',
                    'hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:-translate-y-0.5',
                    'disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0',
                    className,
                ].join(' ')}
                aria-label={label}
            >
                {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <CreditCard size={16} />
                )}
                {loading ? 'Redirecionando...' : label}
            </button>

            {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
        </div>
    );
}
