/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── INHO Brand Palette ───────────────────────────────
        'inho-black':   '#030712',
        'inho-dark':    '#0a0f1e',
        'inho-surface': '#0f172a',
        'inho-card':    '#111827',
        'inho-border':  '#1e2d40',

        // Primary – Gold/Amber (wealth + impact)
        'inho-gold':        '#f5a623',
        'inho-gold-light':  '#fcd34d',
        'inho-gold-dark':   '#b7791f',

        // Accent – Emerald (growth + social)
        'inho-green':       '#10b981',
        'inho-green-light': '#34d399',
        'inho-green-dark':  '#065f46',

        // Highlight – Sky Blue (trust + technology)
        'inho-blue':        '#0ea5e9',
        'inho-blue-light':  '#38bdf8',

        // Text
        'inho-text':        '#f8fafc',
        'inho-muted':       '#64748b',
        'inho-subtle':      '#334155',
      },
      fontFamily: {
        sans:  ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'inho-gradient':      'linear-gradient(135deg, #030712 0%, #0a0f1e 50%, #0f172a 100%)',
        'inho-gold-gradient': 'linear-gradient(135deg, #f5a623 0%, #fcd34d 50%, #b7791f 100%)',
        'inho-hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.15) 0%, transparent 60%), linear-gradient(180deg, #030712 0%, #0a0f1e 100%)',
        'inho-card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'mesh-pattern':       "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f5a623' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-gold':     'pulse-gold 3s ease-in-out infinite',
        'float':          'float 6s ease-in-out infinite',
        'float-delayed':  'float 6s ease-in-out 2s infinite',
        'slide-up':       'slide-up 0.6s ease-out forwards',
        'fade-in':        'fade-in 0.8s ease-out forwards',
        'shimmer':        'shimmer 2.5s linear infinite',
        'spin-slow':      'spin 8s linear infinite',
        'glow-pulse':     'glow-pulse 2s ease-in-out infinite',
        'count-up':       'fade-in 1s ease-out forwards',
        'border-flow':    'border-flow 4s linear infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':       { opacity: '1',   transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245,166,35,0.3)' },
          '50%':       { boxShadow: '0 0 40px rgba(245,166,35,0.7), 0 0 80px rgba(245,166,35,0.3)' },
        },
        'border-flow': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      boxShadow: {
        'inho-gold':    '0 0 30px rgba(245,166,35,0.3)',
        'inho-green':   '0 0 30px rgba(16,185,129,0.3)',
        'inho-card':    '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.2)',
        'inho-hover':   '0 20px 40px rgba(0,0,0,0.4), 0 0 60px rgba(245,166,35,0.1)',
      },
    },
  },
  plugins: [],
};
