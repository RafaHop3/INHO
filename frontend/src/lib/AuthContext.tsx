'use client';

/**
 * INHO – AuthContext
 *
 * Provides global authentication state to the entire application.
 * On mount, attempts a silent token refresh using the HttpOnly cookie
 * to rehydrate the session after a page reload.
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { auth } from './auth';
import { authApi, usersApi, type UserMe, type LoginPayload } from './api';

// ── Context Shape ──────────────────────────────────────────────────
interface AuthContextValue {
    /** The authenticated user, or null if logged-out / loading */
    user: UserMe | null;
    /** True during the initial session rehydration on page load */
    isLoading: boolean;
    /** Call this after login to record the new token and load the user */
    login: (payload: LoginPayload) => Promise<void>;
    /** Clears the token (memory + HttpOnly cookie via /auth/logout) */
    logout: () => Promise<void>;
    /** Re-fetches /users/me and updates the in-memory user state */
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserMe | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /** Fetch the current user profile and store it in state */
    const refreshUser = useCallback(async () => {
        try {
            const me = await usersApi.me();
            setUser(me);
        } catch {
            setUser(null);
        }
    }, []);

    /**
     * On mount: silently attempt a token refresh using the HttpOnly cookie.
     * If it succeeds, /users/me is called to rehydrate the user state.
     * This means a page refresh does NOT log the user out.
     */
    useEffect(() => {
        const rehydrate = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1/auth/refresh`,
                    { method: 'POST', credentials: 'include' }
                );
                if (res.ok) {
                    const data = await res.json();
                    auth.setAccessToken(data.access_token);
                    await refreshUser();
                }
            } catch {
                // No valid refresh cookie — user is simply not logged in
            } finally {
                setIsLoading(false);
            }
        };

        rehydrate();
    }, [refreshUser]);

    const login = useCallback(async (payload: LoginPayload) => {
        const data = await authApi.login(payload);
        auth.setAccessToken(data.access_token);
        // Refresh cookie is set by the backend in the Set-Cookie response header
        await refreshUser();
    }, [refreshUser]);

    const logout = useCallback(async () => {
        try {
            await authApi.logout(); // clears the HttpOnly cookie server-side
        } catch {
            // ignore network errors on logout
        } finally {
            auth.clearAccessToken();
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
}
