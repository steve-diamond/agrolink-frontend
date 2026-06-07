"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import API from "../../src/services/api";
import type { Notification } from "../../types/notification";
import { QUERY_KEYS } from "../query-keys";
import { REALTIME_QUERY_OPTIONS } from "../query-client";

type NotificationsResponse =
  | Notification[]
  | { data: Notification[] }
  | { data: { notifications: Notification[] } };

function extractNotifications(res: NotificationsResponse): Notification[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray((res as { data: Notification[] }).data)) {
    return (res as { data: Notification[] }).data;
  }
  const nested = (res as { data?: { notifications?: Notification[] } }).data
    ?.notifications;
  return Array.isArray(nested) ? nested : [];
}

/**
 * Fetch notifications with real-time polling (every 30 s).
 * Uses REALTIME cache strategy (staleTime: 0, refetchInterval: 30 s).
 */
export function useNotifications(): UseQueryResult<Notification[]> {
  return useQuery({
    queryKey: QUERY_KEYS.notifications(),
    queryFn: async () => {
      const res = await API.get<NotificationsResponse>("/notifications");
      return extractNotifications(res);
    },
    ...REALTIME_QUERY_OPTIONS,
  });
}

/**
 * Mark a single notification as read.
 * Optimistically removes it from the list; re-fetches on settle.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      API.patch(`/notifications/${notificationId}/read`, {}),

    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.notifications(),
      });

      const previous = queryClient.getQueryData<Notification[]>(
        QUERY_KEYS.notifications()
      );

      queryClient.setQueryData<Notification[]>(
        QUERY_KEYS.notifications(),
        (old = []) =>
          old.filter(
            (n) => (n._id ?? n.id) !== notificationId
          )
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(QUERY_KEYS.notifications(), ctx?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notifications(),
      });
    },
  });
}
