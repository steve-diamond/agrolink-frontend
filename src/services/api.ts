const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
import * as Sentry from "@sentry/nextjs";


type GetOptions = {
  params?: Record<string, string | number | boolean | undefined | null>;
};

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const API = {
  async get<R = unknown>(endpoint: string, options?: GetOptions): Promise<R> {
    let url = `${API_URL}${endpoint}`;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      Sentry.captureMessage("API GET failed", {
        level: "error",
        extra: { endpoint, method: "GET", status: res.status, message: body?.message },
      });
      throw new Error(body?.message || "API GET failed");
    }
    return res.json();
  },

  async post<T, R = unknown>(endpoint: string, data: T): Promise<R> {
    const res = await fetch(`${API_URL}${endpoint}` , {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      Sentry.captureMessage("API POST failed", {
        level: "error",
        extra: { endpoint, method: "POST", status: res.status, message: body?.message },
      });
      throw new Error(body?.message || "API POST failed");
    }
    return res.json();
  },

  async patch<T, R = unknown>(endpoint: string, data: T): Promise<R> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: data !== null && data !== undefined ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      Sentry.captureMessage("API PATCH failed", {
        level: "error",
        extra: { endpoint, method: "PATCH", status: res.status, message: body?.message },
      });
      throw new Error(body?.message || "API PATCH failed");
    }
    return res.json();
  },

  async delete<R = unknown>(endpoint: string): Promise<R> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      Sentry.captureMessage("API DELETE failed", {
        level: "error",
        extra: { endpoint, method: "DELETE", status: res.status, message: body?.message },
      });
      throw new Error(body?.message || "API DELETE failed");
    }
    return res.json();
  },
};
export default API;
