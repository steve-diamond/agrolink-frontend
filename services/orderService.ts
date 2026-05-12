import API from "../src/services/api";

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
  createdAt?: string;
  totalAmount?: number;
  totalPrice?: number;
  paymentStatus?: string;
};

export async function getOrders(): Promise<Order[]> {
  const res = await API.get<{ data?: Order[] | { orders?: Order[]; data?: { items?: Order[] } } }>("/api/orders");
  if (Array.isArray(res.data)) return res.data as Order[];
  if (Array.isArray((res.data as { orders?: unknown[] })?.orders)) return (res.data as { orders: Order[] }).orders;
  if (Array.isArray((res.data as { data?: { items?: unknown[] } })?.data?.items)) return (res.data as { data: { items: Order[] } }).data.items;
  return [];
}
