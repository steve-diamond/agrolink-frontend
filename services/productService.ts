import API from "./api";

export type Product = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  location: string;
  description?: string;
  imageUrl?: string;
  farmer?: string;
  approved?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type NewProduct = Omit<Product, "_id" | "createdAt" | "updatedAt">;

export type ProductFilters = {
  approved?: boolean;
  farmer?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const res = await API.get("/api/products", {
    params: {
      ...filters,
      approved:
        typeof filters.approved === "boolean" ? String(filters.approved) : undefined,
    },
  });
  // Backend may return a plain array OR a wrapped { data: { items: [] } } shape
  const raw = res.data as unknown;
  if (Array.isArray(raw)) return raw as Product[];
  if (Array.isArray((raw as any)?.data?.items)) return (raw as any).data.items as Product[];
  if (Array.isArray((raw as any)?.products)) return (raw as any).products as Product[];
  return [];
}

export async function createProduct(data: NewProduct): Promise<Product> {
  const res = await API.post<Product>("/api/products", data);
  return res.data;
}
