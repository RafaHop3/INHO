/**
 * INHO – Next.js Edge Middleware
 *
 * Runs SERVER-SIDE before every request — before any React renders.
 * This is the hard security gate: even if JavaScript is disabled
 * or the client-side auth state is tampered with, unauthenticated
 * requests to protected routes are caught and redirected here.
 *
 * Strategy:
 *   - Check for the refresh token cookie ('inho_refresh_token').
 *   - If absent on a protected route → redirect to /login.
 *   - If present on /login or /register → redirect to /dashboard.
 *
 * Note: The cookie name set by FastAPI's /auth/login endpoint
 * Confirmed in backend/routers/auth.py: response.set_cookie(key="inho_refresh_token", ...)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require an active session
const PROTECTED_PREFIXES = ['/dashboard', '/admin'];

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ['/login', '/register'];

// The cookie name set by FastAPI's /auth/login endpoint
const REFRESH_COOKIE = 'inho_refresh';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasSession = request.cookies.has(REFRESH_COOKIE);

    // ── Guard: redirect logged-out users away from protected pages ──
    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
    );

    if (isProtected && !hasSession) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname); // preserve intended URL
        return NextResponse.redirect(loginUrl);
    }

    // ── Guard: redirect logged-in users away from auth pages ────────
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    if (isAuthRoute && hasSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Only run this middleware on relevant paths (not on API routes, _next, static files)
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/login',
        '/register',
    ],
};
