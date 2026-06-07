import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { visionPoints } from "@/lib/visionPoints";

const staticRoutes = [
  "/",
  "/about-us",
  "/join-us",
  "/marketplace",
  "/prices",
  "/vision",
  "/loan-application",
  "/loan-calculator",
  "/logistics",
  "/warehouse",
  "/insurance",
  "/cooperatives",
  "/equipment-listing",
  "/inputs",
  "/invest",
  "/product-listing",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));

  const visionEntries: MetadataRoute.Sitemap = visionPoints.map((point) => ({
    url: absoluteUrl(`/vision/${point.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...visionEntries];
}
