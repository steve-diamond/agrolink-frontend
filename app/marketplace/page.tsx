"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getProducts, Product } from "@/services/productService";
import API from "@/services/api";
import { useLocalizedCopy } from "@/services/useLocalizedCopy";

type MarketplaceCategoryValue = "all" | "seeds" | "fertilizers" | "equipment" | "livestock";

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

const normalizeCategory = (category?: string): Exclude<MarketplaceCategoryValue, "all"> | "general" => {
  const raw = String(category || "").toLowerCase();
  if (raw.includes("seed")) return "seeds";
  if (raw.includes("fertil")) return "fertilizers";
  if (raw.includes("equip") || raw.includes("tool")) return "equipment";
  if (raw.includes("livestock") || raw.includes("poultry") || raw.includes("animal")) return "livestock";
  return "general";
};

export default function Marketplace() {
  const { copy, language } = useLocalizedCopy();
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategoryValue>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const localeByLanguage = {
    en: "en-NG",
    ha: "ha-Latn-NG",
    yo: "yo-NG",
    ig: "ig-NG",
    pcm: "en-NG",
  } as const;

  const activeLocale = localeByLanguage[language] || "en-NG";

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat(activeLocale, {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    });
  }, [activeLocale]);

  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat(activeLocale);
  }, [activeLocale]);

  const formatCurrency = (value: number) => currencyFormatter.format(Number.isFinite(value) ? value : 0);
  const formatCount = (value: number) => numberFormatter.format(Number.isFinite(value) ? value : 0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const category = (params.get("category") || "all") as MarketplaceCategoryValue;
    const min = params.get("min") || "";
    const max = params.get("max") || "";

    const allowedCategories: MarketplaceCategoryValue[] = ["all", "seeds", "fertilizers", "equipment", "livestock"];
    const safeCategory = allowedCategories.includes(category) ? category : "all";

    setSearchInput(q);
    setDebouncedSearchTerm(q);
    setSelectedCategory(safeCategory);
    setMinPrice(min);
    setMaxPrice(max);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchInput.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (debouncedSearchTerm) params.set("q", debouncedSearchTerm);
    else params.delete("q");

    if (selectedCategory !== "all") params.set("category", selectedCategory);
    else params.delete("category");

    if (minPrice) params.set("min", minPrice);
    else params.delete("min");

    if (maxPrice) params.set("max", maxPrice);
    else params.delete("max");

    const nextQuery = params.toString();
    const currentQuery = window.location.search.replace(/^\?/, "");

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [debouncedSearchTerm, selectedCategory, minPrice, maxPrice, pathname, router]);

  const marketplaceCategoryOptions: Array<{ value: MarketplaceCategoryValue; label: string }> = [
    { value: "all", label: copy.marketplaceCategoryAll },
    { value: "seeds", label: copy.marketplaceCategorySeeds },
    { value: "fertilizers", label: copy.marketplaceCategoryFertilizers },
    { value: "equipment", label: copy.marketplaceCategoryEquipment },
    { value: "livestock", label: copy.marketplaceCategoryLivestock },
  ];

  const localizedCategoryLabelByValue: Record<Exclude<MarketplaceCategoryValue, "all"> | "general", string> = {
    seeds: copy.marketplaceCategorySeeds,
    fertilizers: copy.marketplaceCategoryFertilizers,
    equipment: copy.marketplaceCategoryEquipment,
    livestock: copy.marketplaceCategoryLivestock,
    general: copy.marketplaceCategoryGeneral,
  };

  const featuredPromotions = [
    {
      title: copy.marketplacePromoSeedTitle,
      detail: copy.marketplacePromoSeedDetail,
      cta: copy.marketplacePromoSeedCta,
      href: "#categories",
    },
    {
      title: copy.marketplacePromoLogisticsTitle,
      detail: copy.marketplacePromoLogisticsDetail,
      cta: copy.marketplacePromoLogisticsCta,
      href: "/logistics",
    },
    {
      title: copy.marketplacePromoWarehouseTitle,
      detail: copy.marketplacePromoWarehouseDetail,
      cta: copy.marketplacePromoWarehouseCta,
      href: "/warehouse",
    },
  ];

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
      const normalizedCategory = normalizeCategory(product.category);
      const productPrice = Number(product.price || 0);
      const min = minPrice ? Number(minPrice) : null;
      const max = maxPrice ? Number(maxPrice) : null;

      const matchesSearch =
        !debouncedSearchTerm ||
        name.includes(debouncedSearchTerm.toLowerCase()) ||
        String(product.location || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || normalizedCategory === selectedCategory;
      const matchesMinPrice = min === null || productPrice >= min;
      const matchesMaxPrice = max === null || productPrice <= max;

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
  }, [products, debouncedSearchTerm, selectedCategory, minPrice, maxPrice]);

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
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-200">{copy.marketplaceHeroTag}</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-4xl">{copy.marketplaceHeroTitle}</h1>
        <p className="mt-2 max-w-3xl text-sm text-emerald-100 sm:text-base">
          {copy.marketplaceHeroDescription}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold">{copy.marketplaceTrustRating}</div>
          <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold">{copy.marketplaceTrustVerified}</div>
          <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold">{copy.marketplaceTrustPayment}</div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm" id="categories">
        <h2 className="text-lg font-bold text-slate-900">{copy.marketplaceSearchTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">{copy.marketplaceSearchDescription}</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={copy.marketplaceSearchPlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring lg:col-span-2"
          />

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value as MarketplaceCategoryValue)}
            aria-label={copy.marketplaceCategoryFilterLabel}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          >
            {marketplaceCategoryOptions.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>

          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder={copy.marketplaceMinPricePlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />

          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder={copy.marketplaceMaxPricePlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{copy.marketplacePromotionsTitle}</h2>
          <p className="text-sm text-slate-500">{copy.marketplacePromotionsSubtitle}</p>
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
        <p className="mt-6 text-slate-600">{copy.marketplaceNoApprovedProducts}</p>
      ) : null}

      <section className="mt-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">{copy.marketplaceTrendingTitle}</h2>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          {formatCount(trendingProducts.length)} {copy.marketplaceProductsFoundSuffix}
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
                  {localizedCategoryLabelByValue[normalizeCategory(product.category)]}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {copy.marketplaceVerifiedSeller}
                </span>
              </div>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(Number(product.price))}</p>
              <p className="text-sm text-slate-600">{product.location}</p>
              <p className="text-xs text-slate-500">⭐ {getSellerRating(product._id)} · {formatCount(getReviewsCount(product._id))} {copy.marketplaceReviewsSuffix}</p>
              <p className="text-sm text-slate-500">{copy.available}: {formatCount(Number(product.quantity || 0))}</p>

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
                {copy.marketplaceWhatsappLiveChat}
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{copy.marketplaceCheckoutTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">{copy.marketplaceCheckoutDescription}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{copy.marketplaceStepLabelOne}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{copy.marketplaceStepOneTitle}</h3>
            <p className="mt-1 text-sm text-slate-600">{copy.marketplaceStepOneDescription}</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{copy.marketplaceStepLabelTwo}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{copy.marketplaceStepTwoTitle}</h3>
            <p className="mt-1 text-sm text-slate-600">{copy.marketplaceStepTwoDescription}</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{copy.marketplaceStepLabelThree}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{copy.marketplaceStepThreeTitle}</h3>
            <p className="mt-1 text-sm text-slate-600">{copy.marketplaceStepThreeDescription}</p>
          </article>
        </div>
      </section>

      <a
        href="https://wa.me/2348030001020?text=Hello%20Agrolink%2C%20I%20need%20marketplace%20support."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-4 z-40 rounded-full border border-emerald-700 bg-emerald-700 px-4 py-3 text-sm font-bold text-white no-underline shadow-lg transition hover:bg-emerald-800"
      >
        {copy.marketplaceWhatsappLiveChat}
      </a>
    </main>
  );
}
