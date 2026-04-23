import API from "../src/services/api";

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
    typeof (obj as any)._id === "string" &&
    typeof (obj as any).name === "string" &&
    typeof (obj as any).price === "number" &&
    typeof (obj as any).quantity === "number" &&
    typeof (obj as any).location === "string"
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
  let arr: unknown[] = [];
  if (Array.isArray(raw)) arr = raw;
  else if (Array.isArray((raw as any)?.data?.items)) arr = (raw as any).data.items;
  else if (Array.isArray((raw as any)?.data?.products)) arr = (raw as any).data.products;
  else if (Array.isArray((raw as any)?.products)) arr = (raw as any).products;
  else if (Array.isArray((raw as any)?.items)) arr = (raw as any).items;
  return arr.filter(isProduct);
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
  const res = await API.post<Product>("/api/products", data);
  return res.data;
}
