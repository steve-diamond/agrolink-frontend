import { QueryClient } from "@tanstack/react-query";

// --- Cache strategy presets ---

/** Long-lived static/reference data: commodity lists, crop types, states, etc. */
export const STATIC_QUERY_OPTIONS = {
  staleTime: 60 * 60 * 1000,    // 1 hour
  gcTime: 24 * 60 * 60 * 1000,  // 24 hours
  refetchOnWindowFocus: false,
} as const;

/** Frequently changing data tied to the current user session. */
export const USER_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000,     // 5 minutes
  gcTime: 30 * 60 * 1000,       // 30 minutes
  refetchOnWindowFocus: true,
} as const;

/** Data that changes with user actions or is shared across users. */
export const DYNAMIC_QUERY_OPTIONS = {
  staleTime: 2 * 60 * 1000,     // 2 minutes
  gcTime: 10 * 60 * 1000,       // 10 minutes
  refetchOnMount: true,
  refetchOnWindowFocus: true,
} as const;

/** Near real-time data that should refresh on a short interval. */
export const REALTIME_QUERY_OPTIONS = {
  staleTime: 0,
  gcTime: 5 * 60 * 1000,        // 5 minutes
  refetchInterval: 30 * 1000,   // poll every 30 s
  refetchIntervalInBackground: false,
} as const;

// --- QueryClient factory ---
// Called once inside the QueryProvider via useState to avoid
// sharing state across server requests.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,  // default: 5 min
        gcTime: 30 * 60 * 1000,    // default: 30 min
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          // Do not retry on auth or not-found errors.
          const status = (error as { status?: number })?.status;
          if (status === 401 || status === 403 || status === 404) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
