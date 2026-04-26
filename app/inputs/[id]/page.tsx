"use client";
import React from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import type { PageProps } from 'next';
// import ProductCard from 'components/inputs/ProductCard'; // Removed unused import
import { useCartStore } from 'store/cart';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data, isLoading } = useSWR(`/api/inputs/products/${id}`, (url) => fetch(url).then((r) => r.json()));
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();


  return <div>Product ID: {id}</div>;
}
