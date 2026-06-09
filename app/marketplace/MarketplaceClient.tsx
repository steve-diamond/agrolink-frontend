"use client";

import Image from "next/image";
import { GradeBadge } from "../../components/grading/GradeBadge";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getProducts, Product } from "@services/productService";
import PullToRefresh from "../../components/PullToRefresh";
import API from "@services/api";
import { useLocalizedCopy } from "@services/useLocalizedCopy";
import { absoluteUrl, productSchema } from "@/lib/seo";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { IconType } from "react-icons";
import {
  FaSearch, FaFilter, FaStar, FaShoppingCart, FaWhatsapp,
  FaShieldAlt, FaTruck, FaLeaf, FaSeedling, FaCog, FaHorse,
  FaFlask, FaMapMarkerAlt, FaTag, FaCheckCircle, FaArrowRight,
  FaBolt, FaThumbsUp
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

type MarketplaceCategoryValue = "all" | "seeds" | "fertilizers" | "equipment" | "livestock";

const CATEGORY_CONFIG: Record<MarketplaceCategoryValue, { Icon: IconType; color: string; bg: string; border: string }> = {
  all:          { Icon: FaLeaf,      color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200" },
  seeds:        { Icon: FaSeedling,  color: "text-lime-700",   bg: "bg-lime-50",    border: "border-lime-200" },
  fertilizers:  { Icon: FaFlask,     color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200" },
  equipment:    { Icon: FaCog,       color: "text-slate-700",  bg: "bg-slate-50",   border: "border-slate-200" },
  livestock:    { Icon: FaHorse,     color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200" },
};

const isValidRemoteImageUrl = (value?: string) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch { return false; }
};

const supportWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_SUPPORT_PHONE || "2348129490467";

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
};

const getSellerMetrics = (product: Product): { rating: number | null; reviews: number | null } => {
  const ratingCandidates = [product.rating, product.ratingValue]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  const reviewCandidates = [product.reviewCount, product.reviewsCount]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0);

  return {
    rating: ratingCandidates.length > 0 ? ratingCandidates[0] : null,
    reviews: reviewCandidates.length > 0 ? reviewCandidates[0] : null,
  };
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
  const { trackSearch, trackProductView, trackAddToCart, trackEvent, trackError } = useAnalytics();
  const router = useRouter();
  const pathname = usePathname();
  const trackedProductViewIds = useRef<Set<string>>(new Set());
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
  const [gradeFilter, setGradeFilter] = useState<"A"|"B"|"C"|"U"|"all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const localeByLanguage = { en: "en-NG", ha: "ha-Latn-NG", yo: "yo-NG", ig: "ig-NG", pcm: "en-NG" } as const;
  const activeLocale = localeByLanguage[language as keyof typeof localeByLanguage] || "en-NG";

  const currencyFormatter = useMemo(() => new Intl.NumberFormat(activeLocale, { style: "currency", currency: "NGN", maximumFractionDigits: 0 }), [activeLocale]);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(activeLocale), [activeLocale]);
  const formatCurrency = (v: number) => currencyFormatter.format(Number.isFinite(v) ? v : 0);
  const formatCount = (v: number) => numberFormatter.format(Number.isFinite(v) ? v : 0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const allowedCats: MarketplaceCategoryValue[] = ["all", "seeds", "fertilizers", "equipment", "livestock"];
    const allowedGrades = ["A","B","C","U","all"];
    const cat = params.get("category") || "all";
    const grd = params.get("grade") || "all";
    setSearchInput(params.get("q") || "");
    setDebouncedSearchTerm(params.get("q") || "");
    setSelectedCategory(allowedCats.includes(cat as MarketplaceCategoryValue) ? cat as MarketplaceCategoryValue : "all");
    setMinPrice(params.get("min") || "");
    setMaxPrice(params.get("max") || "");
    setGradeFilter(allowedGrades.includes(grd) ? grd as "A"|"B"|"C"|"U"|"all" : "all");
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearchTerm(searchInput.trim()), 250);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedSearchTerm) params.set("q", debouncedSearchTerm); else params.delete("q");
    if (selectedCategory !== "all") params.set("category", selectedCategory); else params.delete("category");
    if (minPrice) params.set("min", minPrice); else params.delete("min");
    if (maxPrice) params.set("max", maxPrice); else params.delete("max");
    if (gradeFilter !== "all") params.set("grade", gradeFilter); else params.delete("grade");
    const nextQuery = params.toString();
    const currentQuery = window.location.search.replace(/^\?/, "");
    if (nextQuery !== currentQuery) router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [debouncedSearchTerm, selectedCategory, minPrice, maxPrice, gradeFilter, pathname, router]);

  const marketplaceCategoryOptions: Array<{ value: MarketplaceCategoryValue; label: string }> = [
    { value: "all", label: copy.marketplaceCategoryAll },
    { value: "seeds", label: copy.marketplaceCategorySeeds },
    { value: "fertilizers", label: copy.marketplaceCategoryFertilizers },
    { value: "equipment", label: copy.marketplaceCategoryEquipment },
    { value: "livestock", label: copy.marketplaceCategoryLivestock },
  ];

  const localizedCategoryLabelByValue: Record<Exclude<MarketplaceCategoryValue, "all"> | "general", string> = {
    seeds: copy.marketplaceCategorySeeds, fertilizers: copy.marketplaceCategoryFertilizers,
    equipment: copy.marketplaceCategoryEquipment, livestock: copy.marketplaceCategoryLivestock,
    general: copy.marketplaceCategoryGeneral,
  };

  const featuredPromotions = [
    { title: copy.marketplacePromoSeedTitle, detail: copy.marketplacePromoSeedDetail, cta: copy.marketplacePromoSeedCta, href: "#categories", gradient: "from-green-600 to-emerald-800", accent: "bg-green-500/20 text-green-100", icon: <FaSeedling className="text-4xl text-green-200" /> },
    { title: copy.marketplacePromoLogisticsTitle, detail: copy.marketplacePromoLogisticsDetail, cta: copy.marketplacePromoLogisticsCta, href: "/logistics", gradient: "from-blue-700 to-indigo-900", accent: "bg-blue-500/20 text-blue-100", icon: <FaTruck className="text-4xl text-blue-200" /> },
    { title: copy.marketplacePromoWarehouseTitle, detail: copy.marketplacePromoWarehouseDetail, cta: copy.marketplacePromoWarehouseCta, href: "/warehouse", gradient: "from-amber-600 to-orange-800", accent: "bg-amber-500/20 text-amber-100", icon: <FaShieldAlt className="text-4xl text-amber-200" /> },
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getProducts({ approved: true });
      setProducts(items);
      setQuantities(Object.fromEntries(items.map((i) => [i._id, 1])));
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchProducts(); }, [fetchProducts]);

  function getProductGrade(product: Product): "A"|"B"|"C"|"U" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((product as any).produce_grade && ["A","B","C","U"].includes((product as any).produce_grade)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (product as any).produce_grade;
    }
    return (["A","B","C","U"] as const)[product._id.charCodeAt(0) % 4];
  }

  const filteredProducts = useMemo(() => products.filter((p) => {
    const name = String(p.name || "").toLowerCase();
    const cat = normalizeCategory(p.category);
    const price = Number(p.price || 0);
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const grade = getProductGrade(p);
    return (
      (!debouncedSearchTerm || name.includes(debouncedSearchTerm.toLowerCase()) || String(p.location || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase())) &&
      (selectedCategory === "all" || cat === selectedCategory) &&
      (min === null || price >= min) && (max === null || price <= max) &&
      (gradeFilter === "all" || grade === gradeFilter)
    );
  }), [products, debouncedSearchTerm, selectedCategory, minPrice, maxPrice, gradeFilter]);

  useEffect(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return;
    trackSearch(debouncedSearchTerm, filteredProducts.length);
  }, [debouncedSearchTerm, filteredProducts.length, trackSearch]);

  const trendingProducts = useMemo(() => [...filteredProducts].sort((a, b) => Number(b.quantity || 0) - Number(a.quantity || 0)).slice(0, 9), [filteredProducts]);

  const trustStats = useMemo<Array<{ Icon: IconType; iconClass: string; value: string; label: string }>>(() => {
    const uniqueSellers = new Set(
      products
        .map((product) => {
          const seller = product.farmer;
          if (typeof seller === "string") return seller.trim();
          if (seller && typeof seller === "object" && "toString" in seller) return String(seller);
          return "";
        })
        .filter(Boolean)
    );

    const ratings = products
      .map((product) => getSellerMetrics(product).rating)
      .filter((rating): rating is number => typeof rating === "number" && Number.isFinite(rating) && rating > 0);

    const averageRating = ratings.length > 0
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
      : "N/A";

    const inStockListings = products.filter((product) => Number(product.quantity || 0) > 0).length;

    const avgPrice = products.length > 0
      ? products.reduce((sum, product) => sum + Number(product.price || 0), 0) / products.length
      : 0;

    return [
      { Icon: FaStar, iconClass: "text-amber-400", value: averageRating === "N/A" ? "N/A" : `${averageRating}/5`, label: "Avg Seller Rating" },
      { Icon: MdVerified, iconClass: "text-blue-400", value: formatCount(uniqueSellers.size), label: "Active Sellers" },
      { Icon: FaCheckCircle, iconClass: "text-green-400", value: formatCount(inStockListings), label: "In-Stock Listings" },
      { Icon: FaTag, iconClass: "text-purple-400", value: formatCurrency(avgPrice), label: "Avg Listing Price" },
    ];
  }, [products, formatCount, formatCurrency]);

  useEffect(() => {
    trendingProducts.forEach((product) => {
      if (trackedProductViewIds.current.has(product._id)) return;
      trackedProductViewIds.current.add(product._id);
      trackProductView({
        product_id: product._id,
        product_name: product.name,
        price: Number(product.price || 0),
        category: normalizeCategory(product.category),
      });
    });
  }, [trendingProducts, trackProductView]);

  const marketplaceStructuredData = useMemo(() => {
    const productsSchema = filteredProducts.slice(0, 24).map((product) => {
      const { rating, reviews } = getSellerMetrics(product);
      const image = isValidRemoteImageUrl(product.imageUrl)
        ? String(product.imageUrl)
        : absoluteUrl("/agropro/images/banner.jpg");

      const schemaPayload = {
        name: product.name,
        image,
        description: product.description || `${product.name} listed on DOS Agrolink marketplace.`,
        category: product.category || "Agricultural Product",
        seller: product.farmer || "DOS Agrolink Verified Seller",
        price: Number(product.price || 0),
        availability:
          Number(product.quantity || 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: absoluteUrl("/marketplace"),
      } as Parameters<typeof productSchema>[0];

      if (rating !== null && reviews !== null && reviews > 0) {
        schemaPayload.ratingValue = rating.toFixed(1);
        schemaPayload.reviewCount = Math.trunc(reviews);
      }

      return productSchema(schemaPayload);
    });

    return {
      productsSchema,
    };
  }, [filteredProducts]);

  const handleBuyNow = async (product: Product) => {
    const user = getStoredUser();
    const quantity = quantities[product._id] ?? 1;
    if (!user._id) { alert("Please login first"); return; }
    if (user.role !== "buyer") { alert("Only buyers can place orders. Please log in with a buyer account."); return; }
    if (quantity < 1 || quantity > Number(product.quantity || 0)) { alert("Please choose a valid quantity."); return; }
    type OrderApiResponse = { data: { _id: string; totalAmount?: number; totalPrice?: number } };
    type PaymentApiResponse = { data: { data: { authorization_url: string } } };
    try {
      setBuyingProductId(product._id);
      trackAddToCart({
        product_id: product._id,
        product_name: product.name,
        price: Number(product.price || 0),
        category: normalizeCategory(product.category),
        quantity,
      });
      const orderRes = await API.post("/api/orders", { products: [{ productId: product._id, quantity }] }) as OrderApiResponse;
      const order = orderRes.data;
      trackEvent("begin_checkout", {
        product_id: product._id,
        product_name: product.name,
        value: Number(order.totalAmount ?? order.totalPrice ?? 0),
        currency: "NGN",
      });
      const paymentRes = await API.post("/api/payment/initialize", { email: user.email, amount: order.totalAmount ?? order.totalPrice, orderId: order._id, callback_url: `${window.location.origin}/payment-success` }) as PaymentApiResponse;
      window.location.href = paymentRes.data.data.authorization_url;
    } catch (error) {
      trackError(error, { module: "marketplace", action: "handleBuyNow" });
      let errMsg = "Payment failed. Please try again.";
      if (error && typeof error === "object" && "response" in error) {
        const data = (error as { response?: { data?: { message?: string; error?: string } } }).response?.data;
        errMsg = data?.message || data?.error || errMsg;
      } else if (error instanceof Error) errMsg = error.message;
      alert(errMsg);
    } finally { setBuyingProductId(null); }
  };

  return (
    <PullToRefresh onRefresh={fetchProducts} successMessage="Listings updated">
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-gray-50">
      {marketplaceStructuredData.productsSchema.map((productSchema, index) => (
        <script
          key={`product-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      ))}

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-linear-to-br from-green-950 via-green-800 to-emerald-700" aria-labelledby="marketplace-hero-heading">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 marketplace-dot-pattern" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4">
              <FaBolt className="text-amber-400" />
              {copy.marketplaceHeroTag || "Agrolink Marketplace"}
            </span>
            <h1 id="marketplace-hero-heading" className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
              {copy.marketplaceHeroTitle || "Trending Agricultural Products From Verified Sellers"}
            </h1>
            <p className="mt-4 text-lg text-green-100/80 max-w-2xl">
              {copy.marketplaceHeroDescription || "Nigeria's most trusted agri-marketplace - direct from farmers to buyers with secure payments and fast delivery."}
            </p>

            {/* Embedded search bar */}
            <div className="mt-8 flex gap-2 max-w-2xl" role="search">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <label htmlFor="marketplace-search" className="sr-only">Search products</label>
                <input
                  id="marketplace-search"
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search maize, tomatoes, equipment…"
                  aria-label="Search agricultural products"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-white text-gray-900 border-0 shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-controls="marketplace-filters"
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all"
              >
                <FaFilter aria-hidden="true" /> Filters
              </button>
            </div>
          </div>

          {/* Trust stats row */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trustStats.map((s) => (
              <div key={s.label} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <span className="text-xl"><s.Icon className={s.iconClass} /></span>
                <div>
                  <p className="text-white font-bold text-base leading-none">{s.value}</p>
                  <p className="text-green-200/70 text-xs mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* â”€â”€ CATEGORY PILLS â”€â”€ */}
        <section id="categories" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Browse by Category</h2>
            {showFilters && (
              <button type="button" onClick={() => setShowFilters(false)} className="text-xs text-gray-400 hover:text-gray-600 font-semibold">Hide filters</button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {marketplaceCategoryOptions.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat.value];
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    active
                      ? `bg-green-700 text-white border-green-700 shadow-md`
                      : `${cfg.bg} ${cfg.color} ${cfg.border} hover:shadow-sm`
                  }`}
                >
                  <cfg.Icon aria-hidden="true" /> {cat.label}
                </button>
              );
            })}
          </div>

          {/* Advanced filters (toggle) */}
          {showFilters && (
            <div id="marketplace-filters" className="pt-4 border-t border-gray-100 grid gap-3 sm:grid-cols-3">
              <div className="relative">
                <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <select
                  value={gradeFilter}
                  onChange={(e) => { const v = e.target.value; if (["A","B","C","U","all"].includes(v)) setGradeFilter(v as "A"|"B"|"C"|"U"|"all"); }}
                  aria-label="Filter by produce grade"
                  title="Filter by produce grade"
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  <option value="all">All Grades</option>
                  <option value="A">Grade A - Premium</option>
                  <option value="B">Grade B - Standard</option>
                  <option value="C">Grade C - Processing</option>
                  <option value="U">Ungraded</option>
                </select>
              </div>
              <label className="sr-only" htmlFor="min-price">Minimum price in Naira</label>
              <input
                id="min-price"
                type="number" min={0} value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min Price (₦)"
                aria-label="Minimum price"
                className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <label className="sr-only" htmlFor="max-price">Maximum price in Naira</label>
              <input
                id="max-price"
                type="number" min={0} value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max Price (₦)"
                aria-label="Maximum price"
                className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          )}
        </section>

        {/* â”€â”€ FEATURED PROMOTIONS â”€â”€ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{copy.marketplacePromotionsTitle || "Featured Offers"}</h2>
            <span className="text-sm text-gray-400">{copy.marketplacePromotionsSubtitle || "Limited time deals"}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featuredPromotions.map((promo) => (
              <article
                key={promo.title}
                className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${promo.gradient} p-5 text-white shadow-lg`}
              >
                <div className="absolute top-3 right-3 opacity-40">{promo.icon}</div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 ${promo.accent}`}>
                  Limited Offer
                </span>
                <h3 className="text-base font-extrabold leading-snug mb-1">{promo.title}</h3>
                <p className="text-sm opacity-80 mb-4 line-clamp-2">{promo.detail}</p>
                <a
                  href={promo.href}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-bold transition-all"
                >
                  {promo.cta} <FaArrowRight className="text-xs" />
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* â”€â”€ PRODUCT GRID â”€â”€ */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{copy.marketplaceTrendingTitle || "Trending Products"}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Fresh from verified Nigerian farmers</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-bold text-green-700">
              <FaCheckCircle className="text-green-500" />
              {formatCount(trendingProducts.length)} {copy.marketplaceProductsFoundSuffix || "products"}
            </span>
          </div>

          {loading && (
            <div role="status" aria-live="polite" aria-label="Loading products" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <span className="sr-only">Loading products, please wait…</span>
              {[...Array(6)].map((_, i) => (
                <div key={i} aria-hidden="true" className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded-lg w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {fetchError && (
            <div role="alert" aria-live="assertive" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
              <FaShieldAlt className="text-red-400 shrink-0" aria-hidden="true" />
              <span>
                Failed to load products. {fetchError}
              </span>
            </div>
          )}

          {!loading && filteredProducts.length === 0 && !fetchError && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <FaSearch className="text-gray-300 text-4xl mx-auto mb-3" />
              <p className="font-semibold text-gray-500">{copy.marketplaceNoApprovedProducts || "No products found"}</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {trendingProducts.map((product: Product) => {
                const grade = getProductGrade(product);
                const { rating, reviews } = getSellerMetrics(product);
                const catNorm = normalizeCategory(product.category);

                return (
                  <article
                    key={product._id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* Product image */}
                    <div className="relative h-52 overflow-hidden bg-green-50">
                      {isValidRemoteImageUrl(product.imageUrl) ? (
                        <Image
                          src={typeof product.imageUrl === "string" ? product.imageUrl : "/placeholder.png"}
                          alt={product.name}
                          width={800} height={480}
                          unoptimized
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FaLeaf className="text-green-300 text-5xl" />
                        </div>
                      )}
                      {/* Verified badge overlay */}
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-700/90 backdrop-blur-sm text-white text-[10px] font-bold">
                        <MdVerified /> Verified
                      </span>
                      {/* Grade badge overlay */}
                      <span className="absolute top-3 right-3">
                        {grade !== "U" ? (
                          <GradeBadge grade={grade} commodity={product.name || ""} size="sm" />
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-200/90 text-gray-600 text-[10px] font-bold">No Grade</span>
                        )}
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="flex flex-col flex-1 p-5 space-y-3">
                      {/* Category chip */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_CONFIG[catNorm in CATEGORY_CONFIG ? catNorm as MarketplaceCategoryValue : "all"].bg} ${CATEGORY_CONFIG[catNorm in CATEGORY_CONFIG ? catNorm as MarketplaceCategoryValue : "all"].color}`}>
                          {localizedCategoryLabelByValue[catNorm]}
                        </span>
                      </div>

                      {/* Product name */}
                      <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{product.name}</h3>

                      {/* Location */}
                      {product.location && (
                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FaMapMarkerAlt className="text-gray-400 shrink-0" />
                          {product.location}
                        </p>
                      )}

                      {/* Rating */}
                      {rating !== null && reviews !== null && reviews > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {[1,2,3,4,5].map((star) => (
                              <FaStar key={star} className={rating >= star ? "text-amber-400 text-xs" : "text-gray-200 text-xs"} />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({formatCount(reviews)} reviews)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <FaStar className="text-gray-300" />
                          <span>New listing</span>
                        </div>
                      )}

                      {/* Price + stock */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-extrabold text-green-700">{formatCurrency(Number(product.price))}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatCount(Number(product.quantity || 0))} units available</p>
                        </div>
                        {Number(product.quantity || 0) < 10 && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Low stock</span>
                        )}
                      </div>

                      {/* Quantity input */}
                      <div className="flex items-center gap-2">
                        <label htmlFor={`qty-${product._id}`} className="text-xs font-semibold text-gray-600 shrink-0">Qty:</label>
                        <input
                          id={`qty-${product._id}`}
                          type="number" min={1}
                          max={Math.max(1, Number(product.quantity || 1))}
                          value={quantities[product._id] ?? 1}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            setQuantities((cur) => ({ ...cur, [product._id]: Number.isFinite(n) && n > 0 ? n : 1 }));
                          }}
                          className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1 mt-auto">
                        <button
                          type="button"
                          onClick={() => handleBuyNow(product)}
                          disabled={buyingProductId === product._id}
                          aria-label={buyingProductId === product._id ? `Processing order for ${product.name}` : `Buy ${product.name}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 px-4 transition-all shadow-sm hover:shadow-md"
                        >
                          {buyingProductId === product._id ? (
                            <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />{copy.creatingOrder}</span>
                          ) : (
                            <><FaShoppingCart aria-hidden="true" /> {copy.buyNow || "Buy Now"}</>
                          )}
                        </button>
                        <a
                          href={`https://wa.me/${supportWhatsAppNumber}?text=Hello%20Agrolink%2C%20I%20need%20help%20with%20a%20marketplace%20order.`}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 transition-all"
                          aria-label={`Chat about ${product.name} on WhatsApp (opens in new tab)`}
                        >
                          <FaWhatsapp className="text-lg" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* â”€â”€ HOW IT WORKS â”€â”€ */}
        <section className="rounded-2xl bg-linear-to-br from-green-900 to-emerald-800 p-8 text-white shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold">{copy.marketplaceCheckoutTitle || "How It Works"}</h2>
            <p className="mt-2 text-green-200/80">{copy.marketplaceCheckoutDescription || "Buy fresh agricultural produce in 3 easy steps"}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { step: "01", label: copy.marketplaceStepLabelOne, title: copy.marketplaceStepOneTitle, desc: copy.marketplaceStepOneDescription, icon: <FaSearch className="text-3xl text-amber-400" /> },
              { step: "02", label: copy.marketplaceStepLabelTwo, title: copy.marketplaceStepTwoTitle, desc: copy.marketplaceStepTwoDescription, icon: <FaShoppingCart className="text-3xl text-amber-400" /> },
              { step: "03", label: copy.marketplaceStepLabelThree, title: copy.marketplaceStepThreeTitle, desc: copy.marketplaceStepThreeDescription, icon: <FaTruck className="text-3xl text-amber-400" /> },
            ].map((s, i, arr) => (
              <div key={s.step} className="relative">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center">{s.icon}</div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold tracking-[0.15em] text-green-300 uppercase">{s.label || `Step ${s.step}`}</span>
                      <h3 className="text-base font-bold text-white mt-1 mb-2">{s.title}</h3>
                      <p className="text-sm text-green-200/70">{s.desc}</p>
                    </div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <FaArrowRight className="hidden sm:block absolute top-1/2 -right-4 z-10 text-amber-400/50 text-xl -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* â”€â”€ TRUST BANNER â”€â”€ */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { icon: <FaShieldAlt className="text-green-600 text-2xl" />, label: "Buyer Protection", sub: "Full refund guarantee" },
              { icon: <FaCheckCircle className="text-blue-600 text-2xl" />, label: "Verified Products", sub: "Quality assured" },
              { icon: <FaTruck className="text-amber-600 text-2xl" />, label: "Fast Delivery", sub: "Nationwide logistics" },
              { icon: <FaThumbsUp className="text-purple-600 text-2xl" />, label: "5-Star Support", sub: "24/7 WhatsApp" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 p-3">
                {item.icon}
                <p className="font-bold text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
    </PullToRefresh>
  );
}

