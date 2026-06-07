"use client";

import { useEffect, useMemo, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

type Variant = "A" | "B";

function getOrCreateVisitorId() {
  if (typeof window === "undefined") return "server";
  const key = "agrolink_visitor_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = `v_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  window.localStorage.setItem(key, id);
  return id;
}

function hashToBucket(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

export function useExperiment(experimentKey: string, trafficSplit = 50) {
  const { trackEvent } = useAnalytics();
  const [variant, setVariant] = useState<Variant>("A");

  const assignmentKey = useMemo(() => `exp_${experimentKey}_variant`, [experimentKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = window.localStorage.getItem(assignmentKey) as Variant | null;
    if (existing === "A" || existing === "B") {
      setVariant(existing);
      trackEvent("ab_variant_exposure", { experiment_key: experimentKey, variant: existing });
      return;
    }

    const visitorId = getOrCreateVisitorId();
    const bucket = hashToBucket(`${experimentKey}:${visitorId}`);
    const selected: Variant = bucket < trafficSplit ? "A" : "B";
    window.localStorage.setItem(assignmentKey, selected);
    setVariant(selected);
    trackEvent("ab_variant_exposure", { experiment_key: experimentKey, variant: selected });
  }, [assignmentKey, experimentKey, trafficSplit, trackEvent]);

  const trackConversion = (conversionName: string, value?: number) => {
    trackEvent("ab_conversion", {
      experiment_key: experimentKey,
      variant,
      conversion_name: conversionName,
      conversion_value: value ?? 0,
    });
  };

  return {
    variant,
    isVariantA: variant === "A",
    isVariantB: variant === "B",
    trackConversion,
  };
}
