"use client";

import { useCallback } from "react";
import { event as gaEvent } from "nextjs-google-analytics";
import * as Sentry from "@sentry/nextjs";
import { hasAnalyticsConsent } from "@/components/analytics/AnalyticsProvider";

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function sendToBehaviorTools(eventName: string, params?: AnalyticsParams) {
  if (typeof window === "undefined") return;

  if (typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}

export function useAnalytics() {
  const trackEvent = useCallback((name: string, params?: AnalyticsParams) => {
    if (!hasAnalyticsConsent()) return;
    gaEvent(name, params || {});
    sendToBehaviorTools(name, params);
  }, []);

  const trackRegistration = useCallback(
    (role: "buyer" | "farmer", method = "email") => {
      trackEvent("user_registration", { role, method });
      trackEvent("sign_up", { method, role });
    },
    [trackEvent]
  );

  const trackProductView = useCallback(
    (payload: { product_id: string; product_name: string; price: number; category: string }) => {
      trackEvent("product_view", payload);
      trackEvent("view_item", {
        currency: "NGN",
        value: payload.price,
        items: [{ item_id: payload.product_id, item_name: payload.product_name, item_category: payload.category, price: payload.price }],
      });
    },
    [trackEvent]
  );

  const trackAddToCart = useCallback(
    (payload: { product_id: string; product_name: string; price: number; category: string; quantity: number }) => {
      trackEvent("add_to_cart", payload);
      trackEvent("add_to_cart_ecom", {
        currency: "NGN",
        value: payload.price * payload.quantity,
        items: [{ item_id: payload.product_id, item_name: payload.product_name, item_category: payload.category, price: payload.price, quantity: payload.quantity }],
      });
    },
    [trackEvent]
  );

  const trackPurchase = useCallback(
    (payload: { transaction_id: string; value: number; currency?: string }) => {
      trackEvent("purchase", payload);
      trackEvent("purchase_ecom", {
        transaction_id: payload.transaction_id,
        value: payload.value,
        currency: payload.currency || "NGN",
      });
    },
    [trackEvent]
  );

  const trackLoanApplication = useCallback(
    (payload: { amount: number; purpose: string; repayment_months: string }) => {
      trackEvent("loan_application_submission", payload);
      trackEvent("generate_lead", { value: payload.amount, currency: "NGN", ...payload });
    },
    [trackEvent]
  );

  const trackSearch = useCallback(
    (query: string, resultCount?: number) => {
      trackEvent("search_query", { search_term: query, result_count: resultCount ?? 0 });
      trackEvent("search", { search_term: query, result_count: resultCount ?? 0 });
    },
    [trackEvent]
  );

  const trackError = useCallback((error: unknown, context?: AnalyticsParams) => {
    Sentry.captureException(error, { extra: context });
    trackEvent("client_error", { message: error instanceof Error ? error.message : "unknown_error", ...context });
  }, [trackEvent]);

  return {
    trackEvent,
    trackRegistration,
    trackProductView,
    trackAddToCart,
    trackPurchase,
    trackLoanApplication,
    trackSearch,
    trackError,
  };
}
