"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import API from "@/lib/api";
import { Product } from "@/types/domain";
import { ApiResponse } from "@/types/api";

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get<ApiResponse<Product[]>>("/api/products");
        setProducts(res.data.data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-[#2D6A4F]">My Input Listings</h1>
      <div className="mb-6">
        <Link href="/dashboard/seller/upload" className="btn bg-[#2D6A4F] text-white">+ Add New Product</Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : products.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
              <Image src={product.imageUrl || '/placeholder.png'} alt={product.name} width={160} height={160} className="rounded-xl h-40 object-cover mb-2" />
              <div className="font-bold">{product.name}</div>
              {/* Add brand/unit/price if present in Product type */}
              <div className="text-[#2D6A4F] font-semibold">₦{product.price?.toLocaleString()}</div>
              <div className="mt-2 flex gap-2">
                <Link href={`/inputs/${product.id}`} className="btn btn-sm bg-[#40916C] text-white">View</Link>
                {/* TODO: Add edit/delete actions */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No products listed yet.</div>
      )}
    </div>
  );
}
