import API from "../src/services/api";

export type Storage = {
  _id: string;
  userId: string;
  quantityKg: number;
  commodity: string;
  warehouse: string;
  createdAt: string;
  released?: boolean;
};

export async function getStorage(userId?: string): Promise<Storage[]> {
  const res = await API.get<{ data?: { storage?: unknown[] } }>("/api/warehouse", { params: userId ? { userId } : {} });
  if (Array.isArray(res.data?.storage)) return res.data!.storage as Storage[];
  return [];
}
