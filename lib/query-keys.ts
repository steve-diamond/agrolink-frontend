import type { ProductFilters } from "../src/types/product";

/**
 * Centralized, typed query key factory.
 *
 * Every key is a const-tuple so TypeScript can narrow it exactly,
 * which makes cache invalidation safe and predictable.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products() })
 *   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products({ approved: true }) })
 */
export const QUERY_KEYS = {
  // ---------- Products ----------
  products: (filters?: ProductFilters) =>
    filters ? (["products", "list", filters] as const) : (["products"] as const),
  product: (id: string) => ["products", "detail", id] as const,

  // ---------- Orders ----------
  orders: () => ["orders"] as const,
  order: (id: string) => ["orders", "detail", id] as const,

  // ---------- Profile ----------
  profile: () => ["profile", "me"] as const,

  // ---------- Notifications ----------
  notifications: () => ["notifications"] as const,

  // ---------- Market prices ----------
  prices: (params: Record<string, string>) => ["prices", params] as const,

  // ---------- Inputs marketplace ----------
  inputProducts: (params: Record<string, string | number | boolean>) =>
    ["inputProducts", params] as const,

  // ---------- Loans ----------
  loans: (userId?: string) =>
    userId ? (["loans", userId] as const) : (["loans"] as const),

  // ---------- Logistics ----------
  shipments: (userId?: string) =>
    userId ? (["shipments", userId] as const) : (["shipments"] as const),

  // ---------- Warehouse ----------
  storage: (userId?: string) =>
    userId ? (["storage", userId] as const) : (["storage"] as const),

  // ---------- Farming tips (static) ----------
  farmingTips: () => ["farmingTips"] as const,

  // ---------- Users (admin) ----------
  users: () => ["users"] as const,
} as const;
