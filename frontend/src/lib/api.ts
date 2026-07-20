/**
 * INHO – API Client (Secure Edition)
 *
 * Interceptor pattern:
 *  1. Inject Authorization header from in-memory token.
 *  2. On 401 → attempt silent refresh via HttpOnly cookie.
 *  3. If refresh succeeds → retry original request once.
 *  4. If refresh fails → clear token → redirect to /login.
 *
 * The refresh token is NEVER touched in JS — it rides the HttpOnly
 * cookie automatically via credentials:'include'.
 */

import { auth } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Types ──────────────────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  refresh_token?: string; // backend may or may not echo this
  token_type: string;
}

export interface UserMe {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiError {
  detail: string;
}

// ── Silent Refresh (called internally on 401) ──────────────────────
let _refreshPromise: Promise<boolean> | null = null;

async function silentRefresh(): Promise<boolean> {
  // Deduplicate: if multiple requests 401 at the same time, only one refresh fires
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // sends HttpOnly refresh cookie
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return false;
      const data: TokenResponse = await res.json();
      auth.setAccessToken(data.access_token);
      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ── Core Fetch Interceptor ─────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  _retry = false
): Promise<T> {
  const token = auth.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // always send cookies (refresh token)
  });

  // ── 401 Interception ────────────────────────────────────────────
  if (res.status === 401 && !_retry) {
    const refreshed = await silentRefresh();
    if (refreshed) {
      // Retry the original request with the new token
      return apiFetch<T>(path, options, true);
    }
    // Refresh failed — session is dead, send to login
    auth.clearAccessToken();
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
    throw new Error('Sessão expirada. Redirecionando para o login.');
  }

  // ── 204 No Content ──────────────────────────────────────────────
  if (res.status === 204) return {} as T;

  const data = await res.json();

  if (!res.ok) {
    const msg = (data as ApiError).detail ?? 'Erro desconhecido';
    throw new Error(msg);
  }

  return data as T;
}

// ── Auth endpoints ─────────────────────────────────────────────────
export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<{ message: string; user_id: string }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiFetch<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Fires automatically by the interceptor — not called manually */
  refresh: () =>
    apiFetch<TokenResponse>('/api/v1/auth/refresh', { method: 'POST' }),

  /** Clears the HttpOnly refresh cookie server-side */
  logout: () =>
    apiFetch<void>('/api/v1/auth/logout', { method: 'POST' }),
};

// ── Users endpoints ────────────────────────────────────────────────
export const usersApi = {
  me: () => apiFetch<UserMe>('/api/v1/users/me'),
};

// ── Audit endpoints ────────────────────────────────────────────────
export const auditApi = {
  listMyLogs: () => apiFetch<any[]>('/api/v1/audit/me'),
  listAllLogs: () => apiFetch<any[]>('/api/v1/audit/all'),
};

// ── Contracts ─────────────────────────────────────────────────────
import type { ContractOut, ContractCreate, ContractStatus } from '../types/contracts';

export const contractsApi = {
  list: () => apiFetch<ContractOut[]>('/api/v1/contracts/'),
  create: (payload: ContractCreate) =>
    apiFetch<ContractOut>('/api/v1/contracts/', { method: 'POST', body: JSON.stringify(payload) }),
  activate: (id: string) =>
    apiFetch<ContractOut>(`/api/v1/contracts/${id}/activate`, { method: 'POST' }),
  updateStatus: (id: string, new_status: ContractStatus) =>
    apiFetch<ContractOut>(`/api/v1/contracts/${id}/status?new_status=${new_status}`, { method: 'PATCH' }),
};

// ── Sales Orders ───────────────────────────────────────────────────
export const salesOrdersApi = {
  list: () => apiFetch<any[]>('/api/v1/sales-orders/'),
  create: (payload: {
    customer_name: string; amount: number;
    issue_date: string; due_date: string; description?: string; customer_doc?: string;
  }) =>
    apiFetch<any>('/api/v1/sales-orders/', { method: 'POST', body: JSON.stringify(payload) }),
  confirm: (id: string) =>
    apiFetch<any>(`/api/v1/sales-orders/${id}/confirm`, { method: 'POST' }),
  invoice: (id: string) =>
    apiFetch<any>(`/api/v1/sales-orders/${id}/invoice`, { method: 'POST' }),
  cancel: (id: string) =>
    apiFetch<any>(`/api/v1/sales-orders/${id}`, { method: 'DELETE' }),
};

// ── PDV ────────────────────────────────────────────────────────────
import type { OpenRegisterRequest, CashRegisterOut, PDVSaleCreate, PDVSaleOut } from '../types/pdv';

export const pdvApi = {
  openRegister: (payload: OpenRegisterRequest) =>
    apiFetch<CashRegisterOut>('/api/v1/pdv/open', { method: 'POST', body: JSON.stringify(payload) }),
  getSession: () =>
    apiFetch<CashRegisterOut>('/api/v1/pdv/session'),
  registerSale: (registerId: string, payload: PDVSaleCreate) =>
    apiFetch<PDVSaleOut>(`/api/v1/pdv/sale?register_id=${registerId}`, {
      method: 'POST', body: JSON.stringify(payload),
    }),
  listSales: (registerId: string) =>
    apiFetch<PDVSaleOut[]>(`/api/v1/pdv/sales?register_id=${registerId}`),
  closeRegister: (registerId: string) =>
    apiFetch<CashRegisterOut>(`/api/v1/pdv/close?register_id=${registerId}`, { method: 'POST' }),

  /** Downloads the CSV report — uses the same interceptor */
  getReport: async (registerId: string) => {
    const token = auth.getAccessToken();
    const res = await fetch(`${BASE_URL}/api/v1/pdv/report/${registerId}`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Erro ao baixar relatório do caixa');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caixa_${registerId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};

// ── PCO ────────────────────────────────────────────────────────────
export const pcoApi = {
  list: () => apiFetch<any[]>('/api/v1/pco/'),
  create: (payload: any) =>
    apiFetch<any>('/api/v1/pco/', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id: string) => apiFetch<any>(`/api/v1/pco/${id}`),
};
