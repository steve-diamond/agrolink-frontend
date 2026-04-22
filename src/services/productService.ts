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

export function normalizeProductsResponse(raw: unknown): Product[] {
  if (Array.isArray(raw)) return raw as Product[];
  if (
    typeof raw === 'object' && raw !== null &&
    'data' in raw && typeof (raw as { data?: unknown }).data === 'object' && (raw as { data?: unknown }).data !== null
  ) {
    const data = (raw as { data?: unknown }).data;
    if (Array.isArray((data as { items?: unknown[] }).items)) return (data as { items: Product[] }).items;
    if (Array.isArray((data as { products?: unknown[] }).products)) return (data as { products: Product[] }).products;
  }
  if (typeof raw === 'object' && raw !== null) {
    if (Array.isArray((raw as { products?: unknown[] }).products)) return (raw as { products: Product[] }).products;
    if (Array.isArray((raw as { items?: unknown[] }).items)) return (raw as { items: Product[] }).items;
  }
  return [];
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const res = await API.get("/api/products", {
    params: {
      ...filters,
      approved:
        typeof filters.approved === "boolean" ? String(filters.approved) : undefined,
    },
  });
  return normalizeProductsResponse(res.data as unknown);
}

export async function createProduct(data: NewProduct): Promise<Product> {
  const res = await API.post("/api/products", data);
  return res.data;
}
