"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { getProducts, createProduct } from "../../src/services/productService";
import type { Product, NewProduct, ProductFilters } from "../../src/types/product";
import { QUERY_KEYS } from "../query-keys";
import { DYNAMIC_QUERY_OPTIONS } from "../query-client";

// ---- Read -------------------------------------------------------

/**
 * Fetch the product list, optionally filtered.
 * Uses DYNAMIC cache strategy (2 min stale, 10 min gc).
 */
export function useProducts(
  filters: ProductFilters = {}
): UseQueryResult<Product[]> {
  return useQuery({
    queryKey: QUERY_KEYS.products(filters),
    queryFn: () => getProducts(filters),
    ...DYNAMIC_QUERY_OPTIONS,
  });
}

// ---- Mutations ---------------------------------------------------

/**
 * Create a product with optimistic cache update.
 * Adds a temporary entry immediately; rolls back on error.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewProduct) => createProduct(data),
    onMutate: async (newProduct) => {
      // Cancel any in-flight fetches to avoid clobbering optimistic update.
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.products() });

      // Snapshot the current list for rollback.
      const previous = queryClient.getQueryData<Product[]>(QUERY_KEYS.products({}));

      // Optimistically prepend a placeholder product.
      queryClient.setQueryData<Product[]>(QUERY_KEYS.products({}), (old = []) => [
        {
          ...newProduct,
          _id: `__optimistic__${Date.now()}`,
          approved: false,
          createdAt: new Date().toISOString(),
        } as Product,
        ...old,
      ]);

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      // Rollback on failure.
      queryClient.setQueryData(QUERY_KEYS.products({}), ctx?.previous);
    },
    onSettled: () => {
      // Always sync with the server after a mutation.
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products() });
    },
  });
}
