import type { ApiResponse } from "../types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user) as { token?: string };
      return parsed.token ?? null;
    }
  } catch { /* ignore */ }
  return null;
}

function buildHeaders(extra?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (extra) Object.assign(headers, extra);
  return headers;
}

const API = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: buildHeaders(), credentials: 'include' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(body.message ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<ApiResponse<T>>;
  },

  post: async <TReq = unknown, TRes = unknown>(endpoint: string, data?: TReq): Promise<ApiResponse<TRes>> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: data !== undefined ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(body.message ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<ApiResponse<TRes>>;
  },

  put: async <TReq = unknown, TRes = unknown>(endpoint: string, data?: TReq): Promise<ApiResponse<TRes>> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: data !== undefined ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(body.message ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<ApiResponse<TRes>>;
  },

  patch: async <TReq = unknown, TRes = unknown>(endpoint: string, data?: TReq): Promise<ApiResponse<TRes>> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: data !== undefined ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(body.message ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<ApiResponse<TRes>>;
  },

  delete: async <T = unknown>(endpoint: string): Promise<ApiResponse<T>> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(body.message ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<ApiResponse<T>>;
  }
};

export default API;
