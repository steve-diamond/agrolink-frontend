"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import API from "../../src/services/api";
import { getOrders, type Order } from "../../src/services/orderService";
import { QUERY_KEYS } from "../query-keys";
import { USER_QUERY_OPTIONS } from "../query-client";

// ---- Read -------------------------------------------------------

/**
 * Fetch the current user's orders.
 * Uses USER cache strategy (5 min stale, 30 min gc).
 */
export function useOrders(): UseQueryResult<Order[]> {
  return useQuery({
    queryKey: QUERY_KEYS.orders(),
    queryFn: getOrders,
    ...USER_QUERY_OPTIONS,
  });
}

// ---- Mutations ---------------------------------------------------

/**
 * Update an order's status with optimistic update.
 * Immediately reflects the new status; rolls back if the API call fails.
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => API.patch(`/api/orders/${orderId}`, { status }),

    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.orders() });

      const previous = queryClient.getQueryData<Order[]>(QUERY_KEYS.orders());

      queryClient.setQueryData<Order[]>(QUERY_KEYS.orders(), (old = []) =>
        old.map((o) => (o._id === orderId ? { ...o, status } : o))
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(QUERY_KEYS.orders(), ctx?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() });
    },
  });
}
