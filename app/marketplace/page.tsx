"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getProducts, Product } from "@/services/productService";
import API from "@/services/api";

const isValidRemoteImageUrl = (value?: string) => {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    getProducts({ approved: true })
      .then((items) => {
        setProducts(items);
        setQuantities(
          Object.fromEntries(items.map((item) => [item._id, 1]))
        );
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleBuyNow = async (product: Product) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const quantity = quantities[product._id] ?? 1;

    if (!user._id) {
      alert("Please login first");
      return;
    }

    if (user.role !== "buyer") {
      alert("Only buyers can place orders. Please log in with a buyer account.");
      return;
    }

    if (quantity < 1 || quantity > Number(product.quantity || 0)) {
      alert("Please choose a valid quantity.");
      return;
    }

    try {
      setBuyingProductId(product._id);

      const orderRes = await API.post("/api/orders", {
        products: [{ productId: product._id, quantity }],
      });

      const order = orderRes.data;

      const paymentRes = await API.post("/api/payment/initialize", {
        email: user.email,
        amount: order.totalAmount ?? order.totalPrice,
        orderId: order._id,
        callback_url: `${window.location.origin}/payment-success`,
      });

      window.location.href = paymentRes.data.data.authorization_url;
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || error?.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setBuyingProductId(null);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-gradient-to-r from-emerald-900 via-green-800 to-lime-700 p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Marketplace</h1>
        <p className="mt-2 max-w-2xl text-sm text-emerald-100 sm:text-base">
          Fresh farm produce from approved farmers across AgroLink.
        </p>
      </section>

      {loading ? (
        <p className="mt-6 text-slate-600">Loading approved products...</p>
      ) : null}

      {fetchError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error: {fetchError}
        </div>
      ) : null}

      {!loading && products.length === 0 && !fetchError ? (
        <p className="mt-6 text-slate-600">No approved products available yet.</p>
      ) : null}

      <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product: Product) => (
          <article
            key={product._id}
            className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {isValidRemoteImageUrl(product.imageUrl) ? (
              <Image
                src={product.imageUrl as string}
                alt={product.name}
                width={800}
                height={480}
                unoptimized
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center bg-emerald-50 text-sm font-medium text-emerald-700">
                No image available
              </div>
            )}

            <div className="space-y-2 p-4">
              <h2 className="line-clamp-1 text-lg font-semibold text-slate-900">{product.name}</h2>
              <p className="text-sm text-slate-500">{product.category || "General"}</p>
              <p className="text-xl font-bold text-emerald-700">₦{Number(product.price).toLocaleString()}</p>
              <p className="text-sm text-slate-600">{product.location}</p>
              <p className="text-sm text-slate-500">Available: {product.quantity}</p>

              <label
                htmlFor={`quantity-${product._id}`}
                className="mt-2 block text-sm font-medium text-slate-700"
              >
                Quantity
              </label>
              <input
                id={`quantity-${product._id}`}
                type="number"
                min={1}
                max={Math.max(1, Number(product.quantity || 1))}
                value={quantities[product._id] ?? 1}
                onChange={(event) => {
                  const nextQuantity = Number(event.target.value);
                  setQuantities((current) => ({
                    ...current,
                    [product._id]: Number.isFinite(nextQuantity) && nextQuantity > 0 ? nextQuantity : 1,
                  }));
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
              />

              <button
                type="button"
                className="mt-2 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleBuyNow(product)}
                disabled={buyingProductId === product._id}
              >
                {buyingProductId === product._id ? "Creating Order..." : "Buy Now"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
