"use client";

import React, { useState } from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { cn } from "@/components/ui/utils";
import {
  generateBlurDataUrl,
  getResponsiveSizes,
  warnMissingAlt,
  type AspectRatio,
  type ResponsiveSizeContext,
} from "@/lib/image-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OptimizedImageProps
  extends Omit<NextImageProps, "placeholder" | "blurDataURL" | "onError" | "onLoad"> {
  /**
   * Optional fallback image shown when `src` fails to load.
   * Defaults to a neutral SVG placeholder.
   */
  fallbackSrc?: string;
  /**
   * If true, renders a shimmer skeleton while the image loads.
   * Enabled by default. Set to false for decorative/background images.
   */
  showSkeleton?: boolean;
  /**
   * Lock the wrapper to a fixed aspect ratio.
   * Ignored when `fill` is set (fill takes precedence).
   */
  aspectRatio?: AspectRatio;
  /**
   * Base colour used to generate the blur placeholder.
   * Accepts any valid CSS colour string. Defaults to a neutral slate.
   */
  placeholderColor?: string;
  /**
   * Shortcut for common responsive sizes contexts.
   * Sets the `sizes` prop automatically when `sizes` is not provided.
   */
  sizesContext?: ResponsiveSizeContext;
}

// ─── Fallback SVG ─────────────────────────────────────────────────────────────

const DEFAULT_FALLBACK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E" +
  "%3Crect width='400' height='300' fill='%23f1f5f9'/%3E" +
  "%3Cpath d='M150 130 L200 80 L250 130 L230 130 L230 180 L170 180 L170 130 Z' fill='%23cbd5e1'/%3E" +
  "%3Ccircle cx='160' cy='115' r='15' fill='%23cbd5e1'/%3E" +
  "%3C/svg%3E";

// ─── Aspect-ratio wrapper helper ──────────────────────────────────────────────

const ASPECT_PADDING: Record<AspectRatio, string> = {
  "1/1": "pb-[100%]",
  "4/3": "pb-[75%]",
  "16/9": "pb-[56.25%]",
  "3/2": "pb-[66.67%]",
  "2/3": "pb-[150%]",
  "9/16": "pb-[177.78%]",
  "21/9": "pb-[42.86%]",
};

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────

function ImageSkeleton({ className }: { className?: string }): React.JSX.Element {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-0 block overflow-hidden rounded-[inherit]",
        "bg-slate-100",
        className
      )}
    >
      <span
        className={cn(
          "absolute inset-0 block",
          "-translate-x-full animate-[shimmer_1.5s_infinite]",
            "bg-linear-to-r from-transparent via-slate-200/70 to-transparent"
        )}
      />
    </span>
  );
}

// ─── OptimizedImage ────────────────────────────────────────────────────────────

/**
 * Production-ready image component that wraps Next.js `<Image>` with:
 *
 * - **Error handling** — swaps to `fallbackSrc` when the image fails.
 * - **Loading skeleton** — shimmer effect while the image is in flight.
 * - **Aspect-ratio enforcement** — optional wrapper that prevents CLS.
 * - **Blur placeholder** — generated from `placeholderColor` (no extra request).
 * - **Alt-text validation** — console warning in development when `alt` is empty.
 * - **Responsive sizes shortcut** — `sizesContext` maps common layouts to `sizes`.
 *
 * @example
 * // Responsive product card image
 * <OptimizedImage
 *   src={product.image}
 *   alt={product.name}
 *   fill
 *   sizesContext="product"
 *   aspectRatio="4/3"
 *   priority={isAboveFold}
 * />
 *
 * @example
 * // Fixed-size logo
 * <OptimizedImage
 *   src="/dos-agrolink-logo.png"
 *   alt="DOS Agrolink"
 *   width={40}
 *   height={40}
 *   priority
 * />
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK_SVG,
  showSkeleton = true,
  aspectRatio,
  placeholderColor = "#e2e8f0",
  sizesContext,
  sizes,
  className,
  fill,
  width,
  height,
  priority = false,
  ...rest
}) => {
  // Warn in development when alt text is missing
  if (process.env.NODE_ENV !== "production") {
    warnMissingAlt(alt as string | undefined, String(src));
  }

  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const effectiveSrc = errored ? fallbackSrc : src;
  const blurData = generateBlurDataUrl(placeholderColor);

  // Resolve sizes: explicit > sizesContext shortcut > none
  const resolvedSizes = sizes ?? (sizesContext ? getResponsiveSizes(sizesContext) : undefined);

  // ── Image element ──────────────────────────────────────────────────────────
  const imageEl = (
    <NextImage
      src={effectiveSrc}
      alt={alt ?? ""}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={resolvedSizes}
      placeholder="blur"
      blurDataURL={blurData}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (!errored) setErrored(true); // prevent infinite loop if fallback also fails
      }}
      className={cn(
        "transition-opacity duration-300",
        loaded ? "opacity-100" : "opacity-0",
        fill && "object-cover",
        className
      )}
      {...rest}
    />
  );

  // ── Fill / responsive layout (needs a positioned wrapper) ─────────────────
  if (fill) {
    return (
      <span className="relative block h-full w-full overflow-hidden rounded-[inherit]">
        {showSkeleton && !loaded && <ImageSkeleton />}
        {imageEl}
      </span>
    );
  }

  // ── Fixed dimensions with optional aspect-ratio wrapper ───────────────────
  if (aspectRatio && !fill) {
    return (
      <span
        className={cn(
          "relative block w-full overflow-hidden rounded-[inherit]",
          ASPECT_PADDING[aspectRatio]
        )}
      >
        {showSkeleton && !loaded && <ImageSkeleton />}
        <span className="absolute inset-0">{imageEl}</span>
      </span>
    );
  }

  // ── Simple fixed-size image ────────────────────────────────────────────────
  return (
    <span className="relative inline-block overflow-hidden rounded-[inherit]">
      {showSkeleton && !loaded && (
        <ImageSkeleton />
      )}
      {imageEl}
    </span>
  );
};

// ─── Convenience re-exports ───────────────────────────────────────────────────

export type { AspectRatio, ResponsiveSizeContext };
