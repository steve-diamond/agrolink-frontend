import API from "./api";

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
  const res = await API.get("/api/logistics", { params: userId ? { userId } : {} });
  if (Array.isArray(res.data?.shipments)) return res.data.shipments as Shipment[];
  return [];
}
