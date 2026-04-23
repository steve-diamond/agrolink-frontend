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
  // Optionally, add other fields as needed
};

export function isProduct(obj: unknown): obj is Product {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as { _id?: string })._id === "string" &&
    typeof (obj as { name?: string }).name === "string" &&
    typeof (obj as { price?: number }).price === "number" &&
    typeof (obj as { quantity?: number }).quantity === "number" &&
    typeof (obj as { location?: string }).location === "string"
  );
}

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
    let arr: Product[] = [];
    if (Array.isArray(raw) && raw.every(isProduct)) {
      arr = raw as Product[];
    } else if (typeof raw === 'object' && raw !== null) {
      const maybeObj = raw as Record<string, unknown>;
      const data = maybeObj.data as Record<string, unknown> | undefined;
      if (data && Array.isArray(data.items) && data.items.every(isProduct)) {
        arr = data.items as Product[];
      } else if (data && Array.isArray(data.products) && data.products.every(isProduct)) {
        arr = data.products as Product[];
      } else if (Array.isArray(maybeObj.products) && maybeObj.products.every(isProduct)) {
        arr = maybeObj.products as Product[];
      } else if (Array.isArray(maybeObj.items) && maybeObj.items.every(isProduct)) {
        arr = maybeObj.items as Product[];
      }
    }
    return arr;
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
