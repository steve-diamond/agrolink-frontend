"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-keys";
import { DYNAMIC_QUERY_OPTIONS } from "../query-client";

export type PriceRecord = {
  _id?: string;
  commodity: string;
  state: string;
  price: number;
  unit?: string;
  date?: string;
};

type PricesApiResponse =
  | PriceRecord[]
  | { data?: PriceRecord[]; prices?: PriceRecord[] };

function extractPrices(res: PricesApiResponse): PriceRecord[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray((res as { data?: PriceRecord[] }).data))
    return (res as { data: PriceRecord[] }).data;
  if (Array.isArray((res as { prices?: PriceRecord[] }).prices))
    return (res as { prices: PriceRecord[] }).prices;
  return [];
}

export type PricesFilter = {
  state?: string;
  commodity?: string;
};

/**
 * Fetch market prices filtered by state/commodity.
 * Uses DYNAMIC cache strategy (2 min stale, 10 min gc).
 */
export function usePrices(
  filters: PricesFilter = {}
): UseQueryResult<PriceRecord[]> {
  const params: Record<string, string> = {};
  if (filters.state) params.state = filters.state;
  if (filters.commodity) params.commodity = filters.commodity;

  const searchParams = new URLSearchParams(params).toString();
  const url = `/api/prices${searchParams ? `?${searchParams}` : ""}`;

  return useQuery({
    queryKey: QUERY_KEYS.prices(params),
    queryFn: async () => {
      const res = await fetch(url).then((r) => r.json() as Promise<PricesApiResponse>);
      return extractPrices(res);
    },
    ...DYNAMIC_QUERY_OPTIONS,
  });
}
