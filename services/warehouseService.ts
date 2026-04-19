import API from "./api";

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
  const res = await API.get("/api/warehouse", { params: userId ? { userId } : {} });
  if (Array.isArray(res.data?.storage)) return res.data.storage as Storage[];
  return [];
}
