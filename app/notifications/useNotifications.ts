"use client";

/**
 * Re-exports the React Query-backed useNotifications hook so that
 * existing consumers (e.g. app/notifications/page.tsx) keep working
 * without import changes.
 *
 * The hook now polls every 30 s via React Query's refetchInterval instead
 * of a manual setTimeout loop, giving consistent caching and dedup.
 */
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications as useNotificationsQuery } from "../../lib/hooks/useNotifications";
import type { Notification } from "@/types/notification";

export function useNotifications() {
  const queryClient = useQueryClient();
  const { data, isPending, refetch } = useNotificationsQuery();

  const notifications: Notification[] = data ?? [];
  const loading = isPending;

  return {
    notifications,
    loading,
    refetch: async () => {
      await refetch();
    },
    queryClient,
  };
}
