import API from "./api";

export type Order = {
  _id: string;
  status: string;
  quantity?: number;
  buyer?: string;
  buyerId?: {
    name?: string;
    email?: string;
  };
  productId?: string | { _id?: string; name?: string };
  products?: Array<{ quantity: number; productId?: { _id?: string; name?: string } | string }>;
};

export async function getOrders(): Promise<Order[]> {
  const res = await API.get("/api/orders");
  if (Array.isArray(res.data)) return res.data as Order[];
  if (Array.isArray(res.data?.orders)) return res.data.orders as Order[];
  if (Array.isArray(res.data?.data?.items)) return res.data.data.items as Order[];
  return [];
}
