"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartIcon,
  MapPinIcon,
  ShoppingCartIcon,
  EyeIcon,
  StarIcon,
  CheckIcon,
  ShoppingBagIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { cn } from "@/components/ui/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductBadge = "featured" | "new" | "sale" | "organic" | "limited";

export interface ProductSeller {
  id?: string;
  name: string;
  avatar?: string;
  rating: number; // 0–5
  reviewCount?: number;
}

export interface ProductConfig {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // if present and > price, "sale" context
  unit: string; // "per bag", "per kg", etc.
  location: string; // Nigerian state
  image?: string;
  badge?: ProductBadge;
  seller: ProductSeller;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<ProductBadge, { label: string; className: string }> = {
  featured: {
    label: "Featured",
    className: "bg-amber-500 text-amber-950 font-bold",
  },
  new: {
    label: "New",
    className: "bg-emerald-500 text-emerald-950 font-bold",
  },
  sale: {
    label: "Sale",
    className: "bg-rose-500 text-white font-bold",
  },
  organic: {
    label: "Organic",
    className: "bg-green-600 text-white font-semibold",
  },
  limited: {
    label: "Limited",
    className: "bg-purple-500 text-white font-bold",
  },
};

const AVATAR_COLORS = [
  "bg-emerald-600",
  "bg-blue-600",
  "bg-violet-600",
  "bg-orange-600",
  "bg-rose-600",
  "bg-teal-600",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString("en-NG")}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// ─── SellerAvatar ─────────────────────────────────────────────────────────────

interface SellerAvatarProps {
  seller: ProductSeller;
}

function SellerAvatar({ seller }: SellerAvatarProps) {
  if (seller.avatar) {
    return (
      <div className="relative size-6 rounded-full overflow-hidden shrink-0 ring-1 ring-white/15">
        <Image
          src={seller.avatar}
          alt={seller.name}
          fill
          sizes="24px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "size-6 rounded-full shrink-0 flex items-center justify-center",
        "text-[10px] font-bold text-white ring-1 ring-white/20",
        getAvatarColor(seller.name)
      )}
      aria-label={seller.name}
    >
      {getInitials(seller.name)}
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

export interface ProductCardProps {
  product: ProductConfig;
  /** Destination href — defaults to /marketplace/:id */
  href?: string;
  /** Controlled favourite state */
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string, next: boolean) => void;
  /** Pass a handler to show the Add to Cart button */
  onAddToCart?: (id: string) => void | Promise<void>;
  className?: string;
  /** Pass true for above-the-fold images to skip lazy loading */
  priority?: boolean;
}

export function ProductCard({
  product,
  href,
  isFavorited: isFavoritedProp = false,
  onFavoriteToggle,
  onAddToCart,
  className,
  priority = false,
}: ProductCardProps) {
  const [favorited, setFavorited] = useState(isFavoritedProp);
  const [adding, setAdding] = useState(false);

  const resolvedHref = href ?? `/marketplace/${product.id}`;
  const { name, price, originalPrice, unit, location, image, badge, seller } = product;
  const hasDiscount = !!originalPrice && originalPrice > price;
  const badgeCfg = badge ? BADGE_CONFIG[badge] : null;

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorited;
    setFavorited(next);
    onFavoriteToggle?.(product.id, next);
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    await onAddToCart?.(product.id);
    const timer = window.setTimeout(() => setAdding(false), 1500);
    return () => window.clearTimeout(timer);
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden",
        "bg-gray-900 border border-white/8",
        "transition-all duration-300 ease-out will-change-transform",
        "hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 hover:border-white/18",
        className
      )}
    >
      {/* ── Image area ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-4/3 overflow-hidden shrink-0 bg-gray-800">
        {/* Image or fallback */}
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-emerald-950/60 via-gray-800 to-gray-900 flex items-center justify-center">
            <ShoppingBagIcon className="size-14 text-gray-600" aria-hidden />
          </div>
        )}

        {/* Always-on gradient for text legibility */}
        <div
          className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none"
          aria-hidden
        />

        {/* Badge — top-left */}
        {badgeCfg && (
          <span
            className={cn(
              "absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full text-[11px] tracking-wide",
              badgeCfg.className
            )}
          >
            {badgeCfg.label}
          </span>
        )}

        {/* Favourite toggle — top-right, always visible */}
        <motion.button
          type="button"
          onClick={handleFavorite}
          whileTap={{ scale: 0.72 }}
          className={cn(
            "absolute top-2.5 right-2.5 z-20",
            "flex items-center justify-center size-8 rounded-full",
            "backdrop-blur-sm transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
            favorited
              ? "bg-rose-500/90 text-white"
              : "bg-black/45 text-white/80 hover:bg-black/65 hover:text-white"
          )}
          aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
          aria-pressed={favorited}
        >
          <AnimatePresence mode="wait" initial={false}>
            {favorited ? (
              <motion.span
                key="solid"
                initial={{ scale: 0.3, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="flex"
              >
                <HeartIcon className="size-4" aria-hidden />
              </motion.span>
            ) : (
              <motion.span
                key="outline"
                initial={{ scale: 0.3 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="flex"
              >
                <HeartOutline className="size-4" aria-hidden />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Quick-action overlay — slides up on hover */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 p-3",
            "bg-linear-to-t from-black/90 via-black/55 to-transparent",
            "transition-all duration-300 ease-out",
            "translate-y-full opacity-0",
            "group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          <div className="flex gap-2">
            {/* View Details */}
            <Link
              href={resolvedHref}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl",
                "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700",
                "text-white text-xs font-semibold transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              )}
              onClick={(e) => e.stopPropagation()}
              aria-label={`View details for ${name}`}
            >
              <EyeIcon className="size-3.5" aria-hidden />
              View Details
            </Link>

            {/* Add to Cart — only rendered when handler provided */}
            {onAddToCart && (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                aria-label={adding ? "Added to cart" : `Add ${name} to cart`}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl",
                  "text-xs font-semibold transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                  adding
                    ? "bg-emerald-800/80 text-emerald-300 cursor-default w-24"
                    : "bg-white/15 hover:bg-white/25 active:bg-white/10 text-white backdrop-blur-sm w-24"
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {adding ? (
                    <motion.span
                      key="added"
                      className="flex items-center gap-1.5"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <CheckIcon className="size-3.5" aria-hidden />
                      Added!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      className="flex items-center gap-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ShoppingCartIcon className="size-3.5" aria-hidden />
                      Add
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}
          </div>
        </div>

        {/*
          Background image link — covers the image area for mouse clicks.
          aria-hidden + tabIndex=-1 so the title <Link> is the real focus target.
        */}
        <Link
          href={resolvedHref}
          className="absolute inset-0 z-0"
          aria-hidden
          tabIndex={-1}
        />
      </div>

      {/* ── Card body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Product name */}
        <Link
          href={resolvedHref}
          className="group/name focus-visible:outline-none focus-visible:underline"
        >
          <h3
            className={cn(
              "text-sm font-semibold text-white leading-snug line-clamp-2",
              "group-hover/name:text-emerald-300 transition-colors duration-200"
            )}
          >
            {name}
          </h3>
        </Link>

        {/* Price + unit */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xl font-bold text-white tabular-nums">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-500 line-through tabular-nums">
              {formatPrice(originalPrice!)}
            </span>
          )}
          <span className="text-xs text-gray-500 ml-auto leading-none">{unit}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPinIcon className="size-3.5 text-emerald-400 shrink-0" aria-hidden />
          <span>{location}</span>
        </div>

        {/* Push seller to bottom */}
        <div className="flex-1 min-h-2" />

        {/* Seller row */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/8">
          <SellerAvatar seller={seller} />

          <p className="flex-1 min-w-0 text-xs font-medium text-gray-300 truncate">
            {seller.name}
          </p>

          <div className="flex items-center gap-1 shrink-0">
            <StarIcon className="size-3 text-amber-400" aria-hidden />
            <span className="text-xs font-semibold text-gray-300">
              {seller.rating.toFixed(1)}
            </span>
            {seller.reviewCount != null && (
              <span className="text-xs text-gray-600 hidden sm:inline">
                ({seller.reviewCount})
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── ProductCardSkeleton ──────────────────────────────────────────────────────

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading product"
      aria-busy="true"
      className={cn(
        "rounded-2xl overflow-hidden bg-gray-900 border border-white/6 animate-pulse",
        className
      )}
    >
      {/* Image placeholder */}
      <div className="aspect-4/3 bg-white/8" />

      {/* Content placeholders */}
      <div className="p-4 space-y-3">
        {/* Name — two lines */}
        <div className="space-y-1.5">
          <div className="h-3.5 rounded-lg bg-white/10 w-4/5" />
          <div className="h-3.5 rounded-lg bg-white/7 w-3/5" />
        </div>

        {/* Price + unit */}
        <div className="flex items-center gap-3">
          <div className="h-6 rounded-lg bg-white/12 w-24" />
          <div className="h-3 rounded-lg bg-white/6 w-16 ml-auto" />
        </div>

        {/* Location */}
        <div className="h-3 rounded-lg bg-white/8 w-2/5" />

        {/* Seller row */}
        <div className="pt-3 border-t border-white/6 flex items-center gap-2">
          <div className="size-6 rounded-full bg-white/10 shrink-0" />
          <div className="h-3 rounded-lg bg-white/8 flex-1" />
          <div className="h-3 rounded-lg bg-white/6 w-10" />
        </div>
      </div>
    </div>
  );
}

// ─── EmptyProductState ────────────────────────────────────────────────────────

export interface EmptyProductStateProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
  className?: string;
}

export function EmptyProductState({
  title = "No products found",
  description = "Try adjusting your filters or search with different keywords.",
  onClearFilters,
  className,
}: EmptyProductStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "col-span-full flex flex-col items-center justify-center",
        "py-24 px-6 text-center",
        className
      )}
    >
      {/* Icon cluster */}
      <div className="relative mb-8">
        <div className="size-24 rounded-full bg-white/5 border border-white/8 flex items-center justify-center">
          <ShoppingBagIcon className="size-11 text-gray-600" aria-hidden />
        </div>
        {/* Search badge */}
        <div className="absolute -top-1 -right-1 size-9 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-lg leading-none">
          🔍
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-72 leading-relaxed mb-8">
        {description}
      </p>

      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl",
            "bg-white/8 border border-white/12 text-sm font-semibold text-white",
            "hover:bg-white/12 hover:border-white/20 transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
          )}
        >
          <AdjustmentsHorizontalIcon className="size-4" aria-hidden />
          Clear all filters
        </button>
      )}
    </motion.div>
  );
}

// ─── ProductCardGrid ──────────────────────────────────────────────────────────

export interface ProductCardGridProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * When true, renders `loadingCount` skeleton cards instead of children.
   * Useful for initial page load.
   */
  isLoading?: boolean;
  loadingCount?: number;
}

export function ProductCardGrid({
  children,
  className,
  isLoading = false,
  loadingCount = 8,
}: ProductCardGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5",
        "sm:grid-cols-2",
        "lg:grid-cols-3",
        "xl:grid-cols-4",
        className
      )}
    >
      {isLoading
        ? Array.from({ length: loadingCount }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        : children}
    </div>
  );
}

export default ProductCard;
