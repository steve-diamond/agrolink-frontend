export * from "../src/services/logisticsService";
import API from "../src/services/api";

export type Shipment = {
  _id: string;
  userId: string;
  status: string;
  from: string;
  to: string;
  estimatedArrival: string;
  createdAt: string;
};

export async function getShipments(userId?: string): Promise<Shipment[]> {
  const res = await API.get<{ data?: { shipments?: unknown[] } }>("/api/logistics", { params: userId ? { userId } : {} });
  if (Array.isArray(res.data?.shipments)) return res.data!.shipments as Shipment[];
  return [];
}
