"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-keys";
import { DYNAMIC_QUERY_OPTIONS } from "../query-client";

export type InputProduct = {
  _id?: string;
  name: string;
  price: number;
  category?: string;
  state?: string;
  nafdac?: boolean;
  imageUrl?: string;
  description?: string;
};

type InputsApiResponse =
  | InputProduct[]
  | { data?: InputProduct[]; products?: InputProduct[] };

function extractInputProducts(res: InputsApiResponse): InputProduct[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray((res as { data?: InputProduct[] }).data))
    return (res as { data: InputProduct[] }).data;
  if (Array.isArray((res as { products?: InputProduct[] }).products))
    return (res as { products: InputProduct[] }).products;
  return [];
}

export type InputProductsFilter = {
  category?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  nafdac?: boolean;
};

/**
 * Fetch inputs marketplace products with optional filters.
 * Uses DYNAMIC cache strategy (2 min stale, 10 min gc).
 */
export function useInputProducts(
  filters: InputProductsFilter = {}
): UseQueryResult<InputProduct[]> {
  const params: Record<string, string | number | boolean> = {};
  if (filters.category) params.category = filters.category;
  if (filters.state) params.state = filters.state;
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
  if (filters.nafdac) params.nafdac = 1;

  const searchParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    )
  ).toString();
  const url = `/api/inputs/products${searchParams ? `?${searchParams}` : ""}`;

  return useQuery({
    queryKey: QUERY_KEYS.inputProducts(params),
    queryFn: async () => {
      const res = await fetch(url).then(
        (r) => r.json() as Promise<InputsApiResponse>
      );
      return extractInputProducts(res);
    },
    ...DYNAMIC_QUERY_OPTIONS,
  });
}
