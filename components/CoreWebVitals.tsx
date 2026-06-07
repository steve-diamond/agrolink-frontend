"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function CoreWebVitals() {
  const { trackEvent } = useAnalytics();

  useReportWebVitals((metric) => {
    trackEvent("core_web_vitals", {
      metric_name: metric.name,
      metric_value: Number(metric.value.toFixed(2)),
      metric_id: metric.id,
      metric_rating: metric.rating,
    });

    // Keep logs lightweight in development and ready for analytics wiring.
    if (process.env.NODE_ENV !== "production") {
      console.info("[web-vitals]", metric.name, metric.value);
    }
  });

  return null;
}
