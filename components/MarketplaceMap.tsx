"use client";

/**
 * MarketplaceMap — interactive geographic seller map.
 *
 * Uses MapLibre GL via react-map-gl (no API key required).
 * Tiles: Carto Dark Matter (free, no key).
 * Clustering: supercluster.
 *
 * Layout:
 *  - Mobile: full-width map + slide-up seller list
 *  - Desktop: map left (flex-1) + scrollable seller list right (380px)
 *
 * NOTE: MarketplaceMapView is loaded dynamically (ssr: false) because
 * maplibre-gl references browser globals at import time.
 */

import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPinIcon,
  StarIcon,
  ListBulletIcon,
  Squares2X2Icon,
  XMarkIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/components/ui/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SellerLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  reviewCount: number;
  products: { id: string; name: string; price: string }[];
  state: string;
  distance?: number; // km from user, optional
  verified?: boolean;
}

export interface ActiveFilters {
  category?: string[];
  location?: string[];
  minRating?: number;
}

export interface MarketplaceMapProps {
  sellers?: SellerLocation[];
  activeFilters?: ActiveFilters;
  onViewChange?: (mode: "map" | "grid") => void;
  onSellerClick?: (seller: SellerLocation) => void;
  className?: string;
}

/** Internal props passed through the dynamic boundary */
export interface MarketplaceMapViewProps {
  sellers: SellerLocation[];
  selectedSeller: SellerLocation | null;
  onSelectSeller: (seller: SellerLocation | null) => void;
  className?: string;
}

// ─── Mock sellers — Nigerian agricultural markets ───────────────────────────

export const MOCK_SELLERS: SellerLocation[] = [
  {
    id: "s1", name: "Kolade Farm Produce", state: "Lagos",
    latitude: 6.5244, longitude: 3.3792, category: "Vegetables",
    rating: 4.8, reviewCount: 142, verified: true,
    products: [
      { id: "p1", name: "Fresh Tomatoes", price: "₦12K/crate" },
      { id: "p2", name: "Green Pepper", price: "₦8K/bag" },
      { id: "p3", name: "Cucumber", price: "₦5K/crate" },
    ],
  },
  {
    id: "s2", name: "Benue Harvest Cooperative", state: "Benue",
    latitude: 7.7277, longitude: 8.5391, category: "Tubers & Roots",
    rating: 4.9, reviewCount: 87, verified: true,
    products: [
      { id: "p4", name: "Yam (Medium)", price: "₦3.5K/tuber" },
      { id: "p5", name: "Cassava Tubers", price: "₦9K/bag" },
      { id: "p6", name: "Sweet Potato", price: "₦6K/bag" },
    ],
  },
  {
    id: "s3", name: "Kano Fresh Produce", state: "Kano",
    latitude: 12.0022, longitude: 8.5920, category: "Grains & Cereals",
    rating: 4.7, reviewCount: 203, verified: true,
    products: [
      { id: "p7", name: "Ofada Rice", price: "₦38K/bag" },
      { id: "p8", name: "Millet", price: "₦22K/bag" },
      { id: "p9", name: "Sorghum", price: "₦18K/bag" },
    ],
  },
  {
    id: "s4", name: "Delta Fisheries Ltd", state: "Delta",
    latitude: 5.5167, longitude: 5.7333, category: "Fish & Seafood",
    rating: 4.6, reviewCount: 64,
    products: [
      { id: "p10", name: "Catfish (Live)", price: "₦4.5K/kg" },
      { id: "p11", name: "Tilapia (Smoked)", price: "₦3.2K/kg" },
      { id: "p12", name: "Dried Stockfish", price: "₦28K/bundle" },
    ],
  },
  {
    id: "s5", name: "Ibadan Poultry Hub", state: "Oyo",
    latitude: 7.3775, longitude: 3.9470, category: "Poultry",
    rating: 4.5, reviewCount: 118,
    products: [
      { id: "p13", name: "Broiler Chicken", price: "₦5.8K/kg" },
      { id: "p14", name: "Farm Eggs (Crate)", price: "₦2.8K/crate" },
      { id: "p15", name: "Turkey (Live)", price: "₦35K/bird" },
    ],
  },
  {
    id: "s6", name: "Enugu Spice Garden", state: "Enugu",
    latitude: 6.4527, longitude: 7.5099, category: "Spices & Herbs",
    rating: 4.7, reviewCount: 55, verified: true,
    products: [
      { id: "p16", name: "Uziza Leaves", price: "₦1.5K/bundle" },
      { id: "p17", name: "Ogiri Isi", price: "₦800/wrap" },
      { id: "p18", name: "Dry Pepper (Ground)", price: "₦4K/kg" },
    ],
  },
  {
    id: "s7", name: "Jos Plateau Farms", state: "Plateau",
    latitude: 9.9285, longitude: 8.8921, category: "Fruits",
    rating: 4.4, reviewCount: 76,
    products: [
      { id: "p19", name: "Irish Potatoes", price: "₦14K/bag" },
      { id: "p20", name: "Strawberries", price: "₦3.5K/punnet" },
      { id: "p21", name: "Passion Fruit", price: "₦2K/kg" },
    ],
  },
  {
    id: "s8", name: "Kaduna Livestock Market", state: "Kaduna",
    latitude: 10.5167, longitude: 7.4333, category: "Livestock",
    rating: 4.3, reviewCount: 92,
    products: [
      { id: "p22", name: "Goat (Live, adult)", price: "₦85K/head" },
      { id: "p23", name: "Sheep (Mature)", price: "₦75K/head" },
      { id: "p24", name: "Beef (Cut)", price: "₦6.5K/kg" },
    ],
  },
  {
    id: "s9", name: "Ogun Palm Estates", state: "Ogun",
    latitude: 7.0000, longitude: 3.3500, category: "Oilseeds",
    rating: 4.6, reviewCount: 38,
    products: [
      { id: "p25", name: "Palm Oil (Red)", price: "₦28K/keg" },
      { id: "p26", name: "Palm Kernel Oil", price: "₦22K/keg" },
      { id: "p27", name: "Groundnut Oil", price: "₦20K/keg" },
    ],
  },
  {
    id: "s10", name: "Abuja Fresh Market", state: "FCT",
    latitude: 9.0579, longitude: 7.4951, category: "Vegetables",
    rating: 4.2, reviewCount: 167,
    products: [
      { id: "p28", name: "Waterleaf", price: "₦1.2K/bundle" },
      { id: "p29", name: "Ugu (Fluted pumpkin)", price: "₦1.8K/bundle" },
      { id: "p30", name: "Garden Eggs", price: "₦4K/basket" },
    ],
  },
  {
    id: "s11", name: "Port Harcourt Seafood Hub", state: "Rivers",
    latitude: 4.8156, longitude: 7.0498, category: "Fish & Seafood",
    rating: 4.5, reviewCount: 49,
    products: [
      { id: "p31", name: "Shrimp (Fresh)", price: "₦8.5K/kg" },
      { id: "p32", name: "Crayfish (Dried)", price: "₦12K/kg" },
      { id: "p33", name: "Periwinkle", price: "₦3.5K/bag" },
    ],
  },
  {
    id: "s12", name: "Ilorin Grains Depot", state: "Kwara",
    latitude: 8.4966, longitude: 4.5426, category: "Grains & Cereals",
    rating: 4.4, reviewCount: 131,
    products: [
      { id: "p34", name: "Maize (Dry)", price: "₦16K/bag" },
      { id: "p35", name: "Soybeans", price: "₦24K/bag" },
      { id: "p36", name: "Cowpea (Oloyin)", price: "₦28K/bag" },
    ],
  },
  {
    id: "s13", name: "Benin City Produce Co.", state: "Edo",
    latitude: 6.3350, longitude: 5.6037, category: "Processed Foods",
    rating: 4.3, reviewCount: 44,
    products: [
      { id: "p37", name: "Garri (White)", price: "₦8K/bag" },
      { id: "p38", name: "Elubo (Yam flour)", price: "₦18K/bag" },
      { id: "p39", name: "Egusi (Ground)", price: "₦6K/kg" },
    ],
  },
  {
    id: "s14", name: "Sokoto Cattle Ranch", state: "Sokoto",
    latitude: 13.0622, longitude: 5.2339, category: "Livestock",
    rating: 4.6, reviewCount: 28,
    products: [
      { id: "p40", name: "Bull (Grade A)", price: "₦450K/head" },
      { id: "p41", name: "Ram (Mature)", price: "₦95K/head" },
      { id: "p42", name: "Dried Meat (Kilishi)", price: "₦9K/kg" },
    ],
  },
  {
    id: "s15", name: "Onitsha Mega Farm", state: "Anambra",
    latitude: 6.1667, longitude: 6.7833, category: "Tubers & Roots",
    rating: 4.7, reviewCount: 59, verified: true,
    products: [
      { id: "p43", name: "Cocoyam", price: "₦7K/bag" },
      { id: "p44", name: "African Yam Bean", price: "₦18K/bag" },
      { id: "p45", name: "Tiger Nuts", price: "₦4.5K/kg" },
    ],
  },
];

// ─── Category colour map (shared with markers) ──────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  "Grains & Cereals": "#10b981",
  "Tubers & Roots": "#f59e0b",
  Vegetables: "#22c55e",
  Fruits: "#f97316",
  Livestock: "#8b5cf6",
  Poultry: "#ef4444",
  "Fish & Seafood": "#0ea5e9",
  "Spices & Herbs": "#d97706",
  Oilseeds: "#84cc16",
  "Processed Foods": "#ec4899",
};
function catColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "#6b7280";
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAvatarHue(name: string) {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

// ─── MapLoadingFallback ────────────────────────────────────────────────────

function MapLoadingFallback() {
  return (
    <div className="flex-1 min-h-[400px] bg-slate-900 animate-pulse rounded-2xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-white/30">
        <MapPinIcon className="size-10" />
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  );
}

// ─── Dynamic map view — loaded client-only ─────────────────────────────────

const MarketplaceMapView = dynamic<MarketplaceMapViewProps>(
  () => import("@/components/MarketplaceMapView"),
  { ssr: false, loading: () => <MapLoadingFallback /> }
);

// ─── SellerListCard ────────────────────────────────────────────────────────

function SellerListCard({
  seller,
  isSelected,
  onClick,
}: {
  seller: SellerLocation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const hue = getAvatarHue(seller.name);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-white/8 transition-colors",
        isSelected
          ? "bg-emerald-600/12 border-l-2 border-l-emerald-500"
          : "hover:bg-white/5"
      )}
    >
      {/* Avatar */}
      <div
        className="size-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
        style={{ background: `hsl(${hue} 55% 42%)` }}
      >
        {getInitials(seller.name)}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white truncate leading-snug">
            {seller.name}
            {seller.verified && (
              <span className="ml-1.5 text-emerald-400 text-xs">✓</span>
            )}
          </p>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <StarIcon className="size-3 text-amber-400" />
            <span className="text-xs text-white/60">{seller.rating}</span>
          </div>
        </div>

        {/* Category + state */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{
              background: `${catColor(seller.category)}22`,
              color: catColor(seller.category),
            }}
          >
            {seller.category}
          </span>
          <span className="text-xs text-white/40">
            {seller.distance != null
              ? `${seller.distance} km`
              : seller.state}
          </span>
        </div>

        {/* Top 2 products */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {seller.products.slice(0, 2).map((p) => (
            <span
              key={p.id}
              className="text-xs text-white/50 bg-white/6 px-1.5 py-0.5 rounded-md truncate max-w-[120px]"
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ─── CategoryLegend ────────────────────────────────────────────────────────

function CategoryLegend({ categories }: { categories: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-white/8">
      {categories.map((cat) => (
        <div key={cat} className="flex items-center gap-1">
          <span
            className="size-2 rounded-full"
            style={{ background: catColor(cat) }}
          />
          <span className="text-xs text-white/50">{cat}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MarketplaceMap ────────────────────────────────────────────────────────

export function MarketplaceMap({
  sellers: sellersProp,
  activeFilters,
  onViewChange,
  onSellerClick,
  className,
}: MarketplaceMapProps) {
  const [selectedSeller, setSelectedSeller] = useState<SellerLocation | null>(
    null
  );
  const [listOpen, setListOpen] = useState(false); // mobile bottom sheet

  // Apply active filters to seller list
  const sellers = useMemo<SellerLocation[]>(() => {
    const base = sellersProp ?? MOCK_SELLERS;
    if (!activeFilters) return base;

    return base.filter((s) => {
      if (
        activeFilters.category?.length &&
        !activeFilters.category.includes(s.category)
      )
        return false;
      if (
        activeFilters.location?.length &&
        !activeFilters.location.includes(s.state)
      )
        return false;
      if (activeFilters.minRating != null && s.rating < activeFilters.minRating)
        return false;
      return true;
    });
  }, [sellersProp, activeFilters]);

  const categories = useMemo(
    () => [...new Set(sellers.map((s) => s.category))].sort(),
    [sellers]
  );

  const handleSelectSeller = useCallback(
    (seller: SellerLocation | null) => {
      setSelectedSeller(seller);
      if (seller) onSellerClick?.(seller);
    },
    [onSellerClick]
  );

  return (
    <div className={cn("flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/12 bg-slate-900", className)}>
      {/* ── Map panel ─────────────────────────────────────── */}
      <div className="relative flex-1 min-h-[420px] lg:min-h-[680px]">
        <MarketplaceMapView
          sellers={sellers}
          selectedSeller={selectedSeller}
          onSelectSeller={handleSelectSeller}
          className="absolute inset-0"
        />

        {/* ── Floating top-right controls ───────────────── */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {/* View mode toggle (map → grid) */}
          {onViewChange && (
            <button
              onClick={() => onViewChange("grid")}
              title="Switch to grid view"
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium",
                "bg-slate-900/90 backdrop-blur-sm border border-white/12 text-white/70",
                "hover:bg-slate-800 hover:text-white transition-colors shadow-lg"
              )}
            >
              <Squares2X2Icon className="size-4" />
              Grid View
            </button>
          )}

          {/* Filter count badge */}
          {activeFilters &&
            Object.values(activeFilters).some((v) =>
              Array.isArray(v) ? v.length > 0 : v != null
            ) && (
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium bg-emerald-600/90 text-white shadow-lg">
                <AdjustmentsHorizontalIcon className="size-4" />
                Filtered
              </div>
            )}
        </div>

        {/* ── Mobile: result count pill + list toggle ───── */}
        <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => setListOpen(true)}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2.5",
              "bg-slate-900/95 backdrop-blur-md border border-white/15 shadow-xl",
              "text-sm font-semibold text-white"
            )}
          >
            <ListBulletIcon className="size-4 text-emerald-400" />
            {sellers.length} seller{sellers.length !== 1 ? "s" : ""} nearby
            <ChevronUpIcon className="size-4 text-white/50" />
          </button>
        </div>
      </div>

      {/* ── Desktop: right seller list panel ─────────────── */}
      <div className="hidden lg:flex w-[360px] flex-col border-l border-white/10 bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Nearby sellers
            </h3>
            <p className="text-xs text-white/45 mt-0.5">
              {sellers.length} result{sellers.length !== 1 ? "s" : ""}
            </p>
          </div>
          {onViewChange && (
            <button
              onClick={() => onViewChange("grid")}
              title="Switch to grid view"
              className="flex items-center gap-1 text-xs text-white/50 hover:text-emerald-400 transition-colors"
            >
              <Squares2X2Icon className="size-3.5" />
              Grid
            </button>
          )}
        </div>

        {/* Category legend */}
        <CategoryLegend categories={categories} />

        {/* Seller list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {sellers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/30">
              <MapPinIcon className="size-8 mb-2" />
              <p className="text-sm">No sellers match current filters</p>
            </div>
          ) : (
            sellers.map((seller) => (
              <SellerListCard
                key={seller.id}
                seller={seller}
                isSelected={selectedSeller?.id === seller.id}
                onClick={() =>
                  handleSelectSeller(
                    selectedSeller?.id === seller.id ? null : seller
                  )
                }
              />
            ))
          )}
        </div>
      </div>

      {/* ── Mobile: bottom sheet overlay ──────────────────── */}
      <AnimatePresence>
        {listOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-30 bg-black/40"
              onClick={() => setListOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className={cn(
                "lg:hidden fixed bottom-0 left-0 right-0 z-40",
                "max-h-[70vh] rounded-t-3xl bg-slate-900 border-t border-white/12",
                "flex flex-col overflow-hidden shadow-2xl"
              )}
            >
              {/* Drag handle + header */}
              <div className="flex flex-col items-center pt-3 pb-2 border-b border-white/8">
                <div className="w-10 h-1 rounded-full bg-white/20 mb-3" />
                <div className="w-full flex items-center justify-between px-4">
                  <h3 className="text-sm font-semibold text-white">
                    {sellers.length} sellers nearby
                  </h3>
                  <button
                    onClick={() => setListOpen(false)}
                    className="p-1 rounded-lg text-white/40 hover:text-white/80 transition-colors"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>
              </div>

              {/* Category legend */}
              <CategoryLegend categories={categories.slice(0, 4)} />

              {/* Scrollable list */}
              <div className="overflow-y-auto flex-1">
                {sellers.map((seller) => (
                  <SellerListCard
                    key={seller.id}
                    seller={seller}
                    isSelected={selectedSeller?.id === seller.id}
                    onClick={() => {
                      handleSelectSeller(
                        selectedSeller?.id === seller.id ? null : seller
                      );
                      setListOpen(false);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MarketplaceMap;
