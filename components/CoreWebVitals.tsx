"use client";

import { useReportWebVitals } from "next/web-vitals";

type GtagWindow = Window & {
  gtag?: (command: "event", action: string, params: Record<string, string | number>) => void;
};

export default function CoreWebVitals() {
  useReportWebVitals((metric) => {
    const roundedValue = metric.name === "CLS" ? Number(metric.value.toFixed(4)) : Math.round(metric.value);

    // Forward core metrics to Google Analytics when available.
    if (typeof window !== "undefined" && (window as GtagWindow).gtag) {
      (window as GtagWindow).gtag?.("event", metric.name, {
        event_category: "Web Vitals",
        value: roundedValue,
        metric_id: metric.id,
        metric_delta: Number(metric.delta.toFixed(4)),
        metric_rating: metric.rating,
      });
    }
  });

  return null;
}
