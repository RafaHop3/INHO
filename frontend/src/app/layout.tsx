import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata: Metadata = {
  title: {
    default: 'INHO – Gestão Financeira e Impacto Social Global',
    template: '%s | INHO',
  },
  description:
    'Plataforma de gestão financeira de alta disponibilidade, projetada para impacto social global. Transparência, segurança e tecnologia de ponta.',
  keywords: ['INHO', 'finanças', 'impacto social', 'gestão financeira', 'fintech', 'global'],
  authors: [{ name: 'INHO Team' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'INHO',
    title: 'INHO – Gestão Financeira e Impacto Social Global',
    description: 'Plataforma de gestão financeira de alta disponibilidade para impacto social global.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INHO – Gestão Financeira e Impacto Social Global',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-inho-black text-inho-text font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
