
import API from "./api";
import { Product, NewProduct, ProductFilters } from "../types/product";

export function isProduct(obj: unknown): obj is Product {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Product)._id === "string" &&
    typeof (obj as Product).name === "string" &&
    typeof (obj as Product).price === "number" &&
    typeof (obj as Product).quantity === "number" &&
    typeof (obj as Product).location === "string"
  );
}


export function normalizeProductsResponse(raw: unknown): Product[] {
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

import { ApiResponse } from "../types/common";

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const res = await API.get<ApiResponse<Product[]>>("/api/products", {
    params: {
      ...filters,
      approved:
        typeof filters.approved === "boolean" ? String(filters.approved) : undefined,
    },
  });
  // Safe narrowing: check if res.data is an array and contains valid products
  if (Array.isArray(res.data)) {
    return res.data.filter(isProduct);
  }
  return [];
}

export async function createProduct(data: NewProduct): Promise<Product> {
  const res = await API.post<NewProduct, ApiResponse<Product>>("/api/products", data);
  // Safe narrowing: check if res.data is a valid product
  if (isProduct(res.data)) {
    return res.data;
  }
  throw new Error("Invalid product response");
}
