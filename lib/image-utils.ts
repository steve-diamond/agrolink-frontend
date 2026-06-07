/**
 * Image optimization utilities for AgroLink.
 *
 * Supports:
 *  - Cloudinary CDN transforms  (set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
 *  - Vercel Image Optimization  (default / fallback)
 *  - Blur data URLs / LQIP placeholders
 *  - Responsive sizes string helpers
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageTransformOptions {
  /** Target width in pixels */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /**
   * Quality 1–100.
   * Defaults to 80 (good balance between size and visual quality).
   */
  quality?: number;
  /**
   * Output format.
   * "auto" lets the CDN pick the best format for the requesting browser
   * (WebP for modern, JPEG for legacy).
   */
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  /** CSS fit / crop mode */
  fit?: "cover" | "contain" | "fill" | "limit" | "pad";
  /** Gravity for Cloudinary crops */
  gravity?: "auto" | "face" | "center" | "north" | "south";
}

export type ResponsiveSizeContext =
  | "hero"
  | "card"
  | "avatar"
  | "thumbnail"
  | "product"
  | "banner"
  | "logo"
  | "full-width";

// ─── Constants ────────────────────────────────────────────────────────────────

const CLOUDINARY_CLOUD =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    : undefined;

const VERCEL_URL =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_VERCEL_URL
    : undefined;

/**
 * Tiny 1×1 transparent PNG encoded as base64.
 * Used as a silent LQIP when no colour is specified.
 */
const TRANSPARENT_1PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

// ─── Cloudinary ───────────────────────────────────────────────────────────────

/**
 * Builds a Cloudinary fetch/upload URL with transformation parameters.
 *
 * If the `src` is already a Cloudinary URL it is left unchanged (Cloudinary
 * handles chained transforms server-side).
 *
 * @example
 * buildCloudinaryUrl("https://example.com/photo.jpg", { width: 800, quality: 80 })
 * // → "https://res.cloudinary.com/<cloud>/image/fetch/f_auto,q_80,w_800/https://example.com/photo.jpg"
 */
export function buildCloudinaryUrl(
  src: string,
  opts: ImageTransformOptions = {}
): string {
  if (!CLOUDINARY_CLOUD) return src;

  const { width, height, quality = 80, format = "auto", fit = "cover", gravity = "auto" } = opts;

  const transforms: string[] = [
    `f_${format}`,
    `q_${quality}`,
    `c_${fit}`,
    `g_${gravity}`,
  ];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);

  const transformStr = transforms.join(",");

  // For remote images use Cloudinary's "fetch" delivery type
  const isRemote = src.startsWith("http://") || src.startsWith("https://");
  const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image`;
  const path = isRemote ? `fetch/${transformStr}/${src}` : `upload/${transformStr}/${src}`;

  return `${base}/${path}`;
}

/**
 * Next.js custom image loader for Cloudinary.
 *
 * Register in next.config: `images: { loader: "custom", loaderFile: "./lib/cloudinary-loader.ts" }`
 * — or use this directly in <Image loaderFile> for per-component overrides.
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return buildCloudinaryUrl(src, { width, quality: quality ?? 80, format: "auto" });
}

// ─── Vercel Image Optimization ────────────────────────────────────────────────

/**
 * Generates a Vercel Image Optimization URL for use outside of Next.js
 * `<Image>` (e.g. in `<img>` tags in email templates or OG images).
 *
 * The Next.js `<Image>` component calls this internally; only use this
 * function when you need a raw URL string.
 */
export function buildVercelImageUrl(
  src: string,
  opts: Pick<ImageTransformOptions, "width" | "quality"> = {}
): string {
  const { width = 800, quality = 80 } = opts;
  const base = VERCEL_URL ? `https://${VERCEL_URL}` : "";
  return `${base}/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

// ─── Auto CDN router ──────────────────────────────────────────────────────────

/**
 * Returns an optimized image URL using whichever CDN is configured.
 * Falls back to the original `src` when no CDN is available (e.g. local dev).
 *
 * Priority: Cloudinary → Vercel → original
 */
export function getOptimizedImageUrl(
  src: string,
  opts: ImageTransformOptions = {}
): string {
  if (!src) return "";
  if (CLOUDINARY_CLOUD) return buildCloudinaryUrl(src, opts);
  // Vercel Optimization URL is only useful in server-side / edge code
  if (VERCEL_URL) return buildVercelImageUrl(src, opts);
  return src;
}

// ─── Blur / LQIP placeholders ─────────────────────────────────────────────────

/**
 * Returns a base64 SVG data URL filled with `color` to use as a
 * smooth-loading blur placeholder.
 *
 * @param color  Any valid CSS colour string. Defaults to a neutral gray.
 * @param width  Placeholder width in pixels (default 8).
 * @param height Placeholder height in pixels (default 8).
 */
export function generateBlurDataUrl(
  color = "#e2e8f0",
  width = 8,
  height = 8
): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'><rect width='${width}' height='${height}' fill='${color}'/></svg>`;
  // btoa only works in browsers; use Buffer on Node
  const encoded =
    typeof btoa !== "undefined"
      ? btoa(svg)
      : Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Generates a Low-Quality Image Placeholder (LQIP) using Cloudinary's
 * "e_blur:1000,q_1,f_auto" transform chain.
 *
 * Falls back to a colour-based SVG when Cloudinary is not configured.
 */
export function generateLQIP(src: string, color = "#e2e8f0"): string {
  if (!src) return generateBlurDataUrl(color);
  if (CLOUDINARY_CLOUD) {
    return buildCloudinaryUrl(src, {
      quality: 1,
      width: 16,
      format: "webp",
      fit: "cover",
    });
  }
  return generateBlurDataUrl(color);
}

/**
 * Transparent 1×1 PNG — the cheapest possible placeholder.
 * Use when you want zero layout shift without any colour hint.
 */
export const transparentPlaceholder = TRANSPARENT_1PX;

// ─── Responsive sizes helpers ─────────────────────────────────────────────────

/**
 * Common responsive `sizes` strings for Next.js `<Image>`.
 *
 * @example
 * <Image sizes={getResponsiveSizes("card")} ... />
 */
export function getResponsiveSizes(context: ResponsiveSizeContext): string {
  const map: Record<ResponsiveSizeContext, string> = {
    hero: "100vw",
    "full-width": "100vw",
    banner: "(max-width: 768px) 100vw, 80vw",
    card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    product: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    thumbnail: "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw",
    avatar: "48px",
    logo: "(max-width: 768px) 32px, 56px",
  };
  return map[context];
}

// ─── Alt-text guard (dev-only) ────────────────────────────────────────────────

/**
 * Warns in development when an image has no alt text.
 * Call inside a component's render path; compiled away in production.
 */
export function warnMissingAlt(alt: string | undefined, src: string): void {
  if (process.env.NODE_ENV !== "production" && !alt) {
    console.warn(
      `[OptimizedImage] Missing "alt" prop for image: ${src}\n` +
        "All images must have descriptive alt text for accessibility."
    );
  }
}

// ─── Aspect ratio helpers ─────────────────────────────────────────────────────

/** Common aspect ratios as padding-bottom percentages (used in CSS padding trick). */
export const ASPECT_RATIOS = {
  "1/1": "100%",
  "4/3": "75%",
  "16/9": "56.25%",
  "3/2": "66.67%",
  "2/3": "150%",
  "9/16": "177.78%",
  "21/9": "42.86%",
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;
