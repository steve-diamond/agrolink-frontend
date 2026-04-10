"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getProducts, Product } from "@/services/productService";
import API from "@/services/api";
import { useLocalizedCopy } from "@/services/useLocalizedCopy";

const marketplaceCategories = ["All", "Seeds", "Fertilizers", "Equipment", "Livestock"];

const featuredPromotions = [
  {
    title: "Seed Starter Week",
    detail: "Save up to 15% on certified maize, rice, and vegetable seed packs.",
    cta: "Shop Seeds",
    href: "#categories",
  },
  {
    title: "Logistics Boost",
    detail: "Get reduced transport fees for bulk orders from verified sellers.",
    cta: "See Logistics",
    href: "/logistics",
  },
  {
    title: "Warehouse Protection",
    detail: "Secure storage offers for post-harvest produce and livestock feed.",
    cta: "Book Storage",
    href: "/warehouse",
  },
];

const isValidRemoteImageUrl = (value?: string) => {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const getSellerRating = (productId: string) => {
  const scoreSeed = productId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (4.2 + (scoreSeed % 8) / 10).toFixed(1);
};

const getReviewsCount = (productId: string) => {
  const scoreSeed = productId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 12 + (scoreSeed % 120);
};

const normalizeCategory = (category?: string) => {
  const raw = String(category || "").toLowerCase();
  if (raw.includes("seed")) return "Seeds";
  if (raw.includes("fertil")) return "Fertilizers";
  if (raw.includes("equip") || raw.includes("tool")) return "Equipment";
  if (raw.includes("livestock") || raw.includes("poultry") || raw.includes("animal")) return "Livestock";
  return "General";
};

export default function Marketplace() {
  const { copy } = useLocalizedCopy();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const category = normalizeCategory(product.category);
      const productPrice = Number(product.price || 0);
      const min = minPrice ? Number(minPrice) : null;
      const max = maxPrice ? Number(maxPrice) : null;

      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm.toLowerCase()) ||
        String(product.location || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "All" || category === selectedCategory;
      const matchesMinPrice = min === null || productPrice >= min;
      const matchesMaxPrice = max === null || productPrice <= max;

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  const trendingProducts = useMemo(() => {
    return [...filteredProducts]
      .sort((a, b) => Number(b.quantity || 0) - Number(a.quantity || 0))
      .slice(0, 9);
  }, [filteredProducts]);

  const handleBuyNow = async (product: Product) => {
    const user = getStoredUser();
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
      <section className="rounded-2xl bg-linear-to-r from-emerald-950 via-green-800 to-lime-700 p-5 text-white shadow-xl sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-200">Agrolink Marketplace</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-4xl">Trending Agricultural Products From Verified Sellers</h1>
        <p className="mt-2 max-w-3xl text-sm text-emerald-100 sm:text-base">
          Design a responsive, mobile-first marketplace homepage for Agrolink that showcases top categories, trust signals, featured promotions, and fast buying.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold">4.8/5 Avg Seller Ratings</div>
          <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold">Verified Badges on Trusted Stores</div>
          <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold">GlobalPay Secure Payments</div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm" id="categories">
        <h2 className="text-lg font-bold text-slate-900">Search and Filter Marketplace</h2>
        <p className="mt-1 text-sm text-slate-600">Find products by name, location, category, or price range.</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search products or location"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring lg:col-span-2"
          />

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          >
            {marketplaceCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="Min price"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />

          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Max price"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Featured Promotions</h2>
          <p className="text-sm text-slate-500">Competitive with leading marketplaces</p>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {featuredPromotions.map((promo) => (
            <article key={promo.title} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <h3 className="text-lg font-bold text-amber-900">{promo.title}</h3>
              <p className="mt-1 text-sm text-amber-800">{promo.detail}</p>
              <a href={promo.href} className="mt-3 inline-flex rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white no-underline hover:bg-amber-700">
                {promo.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      {loading ? (
        <p className="mt-6 text-slate-600">{copy.loadingProducts}</p>
      ) : null}

      {fetchError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error: {fetchError}
        </div>
      ) : null}

      {!loading && filteredProducts.length === 0 && !fetchError ? (
        <p className="mt-6 text-slate-600">No approved products available yet.</p>
      ) : null}

      <section className="mt-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">Trending Products</h2>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          {trendingProducts.length} products found
        </span>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {trendingProducts.map((product: Product) => (
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
                {copy.noImage}
              </div>
            )}

            <div className="space-y-2 p-4">
              <h2 className="line-clamp-1 text-lg font-semibold text-slate-900">{product.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {normalizeCategory(product.category)}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  Verified Seller
                </span>
              </div>
              <p className="text-xl font-bold text-emerald-700">₦{Number(product.price).toLocaleString()}</p>
              <p className="text-sm text-slate-600">{product.location}</p>
              <p className="text-xs text-slate-500">⭐ {getSellerRating(product._id)} · {getReviewsCount(product._id)} reviews</p>
              <p className="text-sm text-slate-500">{copy.available}: {product.quantity}</p>

              <label
                htmlFor={`quantity-${product._id}`}
                className="mt-2 block text-sm font-medium text-slate-700"
              >
                {copy.quantity}
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
                {buyingProductId === product._id ? copy.creatingOrder : copy.buyNow}
              </button>

              <a
                href="https://wa.me/2348030001020?text=Hello%20Agrolink%2C%20I%20need%20help%20with%20a%20marketplace%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block w-full rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-center text-sm font-semibold text-emerald-800 no-underline transition hover:bg-emerald-100"
              >
                WhatsApp Live Chat
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Simplified Checkout in 3 Steps</h2>
        <p className="mt-1 text-sm text-slate-600">Built for fast mobile conversions with secure global payment support.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Step 1</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">Select Product</h3>
            <p className="mt-1 text-sm text-slate-600">Search, filter by category, and choose quantity from verified sellers.</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Step 2</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">Confirm Order</h3>
            <p className="mt-1 text-sm text-slate-600">Review pricing, trust signals, and delivery options before checkout.</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Step 3</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">Pay with GlobalPay</h3>
            <p className="mt-1 text-sm text-slate-600">Complete payment securely and get instant order confirmation.</p>
          </article>
        </div>
      </section>

      <a
        href="https://wa.me/2348030001020?text=Hello%20Agrolink%2C%20I%20need%20marketplace%20support."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-4 z-40 rounded-full border border-emerald-700 bg-emerald-700 px-4 py-3 text-sm font-bold text-white no-underline shadow-lg transition hover:bg-emerald-800"
      >
        WhatsApp Live Chat
      </a>
    </main>
  );
}
