"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import API from "../../src/services/api";
import type { User } from "../../src/services/userService";
import { QUERY_KEYS } from "../query-keys";
import { USER_QUERY_OPTIONS } from "../query-client";

type ProfileApiResponse = {
  status: string;
  data: { user: User };
};

/** Read cached user from localStorage (used as placeholderData). */
function getLocalUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

/**
 * Fetch the authenticated user's profile from /api/auth/me.
 * Disabled when no JWT is present.
 * Uses USER cache strategy (5 min stale, 30 min gc).
 *
 * While a fresh fetch is in-flight, the last value stored in
 * localStorage is shown as placeholder data.
 */
export function useProfile(): UseQueryResult<User> {
  return useQuery({
    queryKey: QUERY_KEYS.profile(),
    queryFn: async () => {
      const res = await API.get<ProfileApiResponse>("/api/auth/me");
      return res.data.user;
    },
    placeholderData: () => getLocalUser() ?? undefined,
    enabled: hasToken(),
    ...USER_QUERY_OPTIONS,
  });
}
