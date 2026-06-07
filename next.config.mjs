import path from "path";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve("."),
  serverExternalPackages: ["mongoose", "bcryptjs", "jsonwebtoken", "africastalking"],
  modularizeImports: {
    "react-icons/?(([^/]*)/?)*": {
      transform: "react-icons/{{ matches.[1] }}/{{ member }}",
    },
  },
  images: {
    // ── Output formats ─────────────────────────────────────────────────────
    // Next.js will serve AVIF for browsers that support it, WebP as fallback,
    // and JPEG/PNG for legacy clients. Generation is lazy (on first request).
    formats: ["image/avif", "image/webp"],

    // ── Responsive breakpoints ─────────────────────────────────────────────
    // deviceSizes drives the srcset widths for full-viewport images.
    // imageSizes drives srcset widths for sub-viewport (component-sized) images.
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384],

    // ── CDN / cache ────────────────────────────────────────────────────────
    // Keep optimised images cached for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,

    // ── Cloudinary loader (opt-in) ─────────────────────────────────────────
    // When NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set the custom loader in
    // lib/image-utils.ts is used for all <Image> components, routing every
    // request through Cloudinary's global CDN with auto-format + auto-quality.
    ...(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      ? { loader: "custom", loaderFile: "./lib/cloudinary-loader.ts" }
      : {}),

    // ── Allowed remote patterns ────────────────────────────────────────────
    remotePatterns: [
      // Cloudinary CDN
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Vercel Blob / Image CDN
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
      },
      // Supabase Storage
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // AWS S3 (any region)
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      // Google user-content (profile avatars)
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      // Allow any HTTPS source (for dev flexibility / farmer-uploaded images)
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/products",
        destination: "/marketplace",
        permanent: true,
      },
      {
        source: "/product",
        destination: "/marketplace",
        permanent: true,
      },
      {
        source: "/apply-loan",
        destination: "/loan-application",
        permanent: true,
      },
      {
        source: "/insure",
        destination: "/insurance",
        permanent: true,
      },
      {
        source: "/loan",
        destination: "/loan-application",
        permanent: true,
      },
      {
        source: "/agri-market",
        destination: "/marketplace",
        permanent: true,
      },
      {
        source: "/investments",
        destination: "/invest",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/about-us",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/join-us",
        permanent: true,
      },
      {
        source: "/old-marketplace/:path*",
        destination: "/marketplace/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
      };

      // Split large vendor chunks into separate bundles so they can be
      // cached independently and only loaded on routes that need them.
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...(config.optimization.splitChunks?.cacheGroups ?? {}),
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: "recharts",
            chunks: "all",
            priority: 20,
          },
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: "framer-motion",
            chunks: "all",
            priority: 20,
          },
        },
      };
    }
    return config;
  },
};

const analyzedConfig = withBundleAnalyzer(nextConfig);

export default withSentryConfig(analyzedConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
