import API from "./api";

export type Storage = {
  _id: string;
  userId?: string;
  quantityKg: number;
  commodity: string;
  warehouse: string;
  createdAt: string;
  released?: boolean;
};

type WarehouseInventoryItem = {
  _id: string;
  owner?: string;
  quantity?: number;
  commodityName?: string;
  warehouse?: { name?: string } | string;
  createdAt?: string;
};

type WarehouseResponse = {
  data?: {
    storage?: WarehouseInventoryItem[];
    items?: WarehouseInventoryItem[];
  };
};

export async function getStorage(userId?: string): Promise<Storage[]> {
  const res = await API.get<WarehouseResponse>("/api/warehouse", { params: userId ? { userId } : {} });
  const items = Array.isArray(res.data?.storage)
    ? res.data?.storage
    : Array.isArray(res.data?.items)
      ? res.data?.items
      : [];

  return items.map((item) => ({
    _id: item._id,
    userId: item.owner,
    quantityKg: Number(item.quantity ?? 0),
    commodity: String(item.commodityName ?? ""),
    warehouse:
      typeof item.warehouse === "string"
        ? item.warehouse
        : String(item.warehouse?.name ?? "Unknown warehouse"),
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    released: false,
  }));
}
