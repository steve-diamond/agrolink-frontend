import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about-us",
          "/join-us",
          "/marketplace",
          "/prices",
          "/vision",
          "/loan-calculator",
          "/insurance",
          "/logistics",
          "/warehouse",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard/",
          "/orders/",
          "/notifications/",
          "/investor/dashboard/",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
