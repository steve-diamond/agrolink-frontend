"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { GoogleAnalytics } from "nextjs-google-analytics";
import CookieConsentBanner from "./CookieConsentBanner";

export type AnalyticsConsentState = "unknown" | "granted" | "denied";

export const ANALYTICS_CONSENT_STORAGE_KEY = "agrolink_analytics_consent";

function readConsent(): AnalyticsConsentState {
  if (typeof window === "undefined") return "unknown";
  const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  if (value === "granted" || value === "denied") return value;
  return "unknown";
}

export function hasAnalyticsConsent() {
  return readConsent() === "granted";
}

export default function AnalyticsProvider() {
  const [consent, setConsent] = useState<AnalyticsConsentState>("unknown");

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "";
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID || "";
  const hotjarVersion = process.env.NEXT_PUBLIC_HOTJAR_VERSION || "6";

  useEffect(() => {
    setConsent(readConsent());
  }, []);

  useEffect(() => {
    if (consent === "unknown") return;
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  }, [consent]);

  const isGranted = consent === "granted";

  const hasBehaviorTool = useMemo(
    () => Boolean(clarityProjectId || hotjarId),
    [clarityProjectId, hotjarId]
  );

  return (
    <>
      {isGranted && gaMeasurementId ? (
        <GoogleAnalytics gaMeasurementId={gaMeasurementId} trackPageViews />
      ) : null}

      {isGranted && clarityProjectId ? (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarityProjectId}");`}
        </Script>
      ) : null}

      {isGranted && hotjarId ? (
        <Script id="hotjar" strategy="afterInteractive">
          {`(function(h,o,t,j,a,r){
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  h._hjSettings={hjid:${hotjarId},hjsv:${hotjarVersion}};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      ) : null}

      {!isGranted && consent !== "denied" ? (
        <CookieConsentBanner
          onAccept={() => setConsent("granted")}
          onReject={() => setConsent("denied")}
        />
      ) : null}

      {isGranted && hasBehaviorTool ? (
        <span className="sr-only" aria-live="polite">
          Analytics tracking enabled.
        </span>
      ) : null}
    </>
  );
}
