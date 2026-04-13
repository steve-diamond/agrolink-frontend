import axios from "axios";

const isPrivateIpv4Host = (hostname: string): boolean => {
  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  const match = hostname.match(/^172\.(\d{1,3})\./);
  if (!match) return false;
  const secondOctet = Number(match[1]);
  return secondOctet >= 16 && secondOctet <= 31;
};

const isLikelyLocalHost = (hostname: string): boolean => {
  if (["localhost", "127.0.0.1", "::1"].includes(hostname)) return true;
  if (isPrivateIpv4Host(hostname)) return true;
  if (!hostname.includes(".")) return true;
  if (hostname.endsWith(".local") || hostname.endsWith(".test") || hostname.endsWith(".localhost")) return true;
  return false;
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = String(window.location.hostname || "").toLowerCase();
    if (isLikelyLocalHost(hostname)) {
      return process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:5000";
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
};

export const api = axios.create({
  baseURL: getBaseUrl(),
});

const isTechnicalDbError = (message: string): boolean => {
  return /users\.insertOne\(\)|buffering timed out|server selection timed out|mongodb|mongo|econnrefused/i.test(
    message
  );
};

const sanitizeApiError = (error: any) => {
  const message = String(
    error?.response?.data?.message || error?.response?.data?.error || error?.message || ""
  );

  if (!isTechnicalDbError(message)) {
    return error;
  }

  const safeMessage = "Service is temporarily unavailable. Please try again shortly.";

  if (error?.response?.data) {
    error.response.data.message = safeMessage;
    if (error.response.data.error) {
      error.response.data.error = safeMessage;
    }
  }

  if (typeof error?.message === "string") {
    error.message = safeMessage;
  }

  return error;
};

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(sanitizeApiError(error))
);

export default api;
