import { ApiResponse } from "./common";

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

export type ProductApiResponse = ApiResponse<Product[]>;
export type NewProductApiResponse = ApiResponse<Product>;
