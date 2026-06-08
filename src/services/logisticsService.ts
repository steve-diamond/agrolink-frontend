import API from "./api";

export type Shipment = {
  _id: string;
  userId?: string;
  status: string;
  from: string;
  to: string;
  estimatedArrival: string;
  createdAt: string;
};

type LogisticsItem = {
  _id: string;
  requester?: string;
  status?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  deliveredAt?: string;
  createdAt?: string;
};

type LogisticsResponse = {
  data?: {
    shipments?: LogisticsItem[];
    items?: LogisticsItem[];
  };
};

export async function getShipments(userId?: string): Promise<Shipment[]> {
  const res = await API.get<LogisticsResponse>("/api/logistics", { params: userId ? { userId } : {} });
  const items = Array.isArray(res.data?.shipments)
    ? res.data?.shipments
    : Array.isArray(res.data?.items)
      ? res.data?.items
      : [];

  return items.map((item) => ({
    _id: item._id,
    userId: item.requester,
    status: String(item.status ?? "pending"),
    from: String(item.pickupLocation ?? ""),
    to: String(item.dropoffLocation ?? ""),
    estimatedArrival: String(item.deliveredAt ?? item.createdAt ?? new Date().toISOString()),
    createdAt: String(item.createdAt ?? new Date().toISOString()),
  }));
}
