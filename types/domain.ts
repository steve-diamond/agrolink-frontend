export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
}

export interface UploadPayload {
  file: File;
  title: string;
}
