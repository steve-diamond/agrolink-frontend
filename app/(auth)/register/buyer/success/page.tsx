"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthShell from "../../../_components/AuthShell";

function BuyerRegisterSuccessContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Buyer";
  const appId = searchParams.get("appId") || "AGR-BUY-00000";
  const queued = searchParams.get("queued") === "1";
  const verificationPending = searchParams.get("verificationPending") === "1";

  const smsTemplate = `Your Dos Agrolink buyer ID is ${appId}. We will complete review within 2 business days.`;

  return (
    <AuthShell
      eyebrow="Buyer Application Submitted"
      title="Thank you for joining Dos Agrolink"
      subtitle="Your buyer onboarding details have been received and queued for verification."
      bullets={[
        "Review window: within 2 business days",
        "Buyer ID generated instantly",
        "Track status from your dashboard",
      ]}
      imageA={{ src: "/agropro/images/service1.jpg", alt: "Food buyer reviewing produce quality" }}
      imageB={{ src: "/agropro/images/news1.jpg", alt: "Warehouse and food supply operations" }}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <p className="m-0 text-sm font-semibold">Thank you, {name}.</p>
          <p className="m-0 mt-1 text-sm">Your buyer application is in review. We will notify you by SMS and email.</p>
        </div>

        <div className="grid gap-3 text-sm text-slate-700">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="m-0 font-semibold text-blue-900">Buyer ID</p>
            <p className="m-0 mt-1 text-lg font-bold text-blue-800">{appId}</p>
          </div>

          {queued ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <p className="m-0 font-semibold">Submission queued</p>
              <p className="m-0 mt-1">Your internet was unstable, so we queued your submission and will sync it automatically.</p>
            </div>
          ) : null}

          {verificationPending ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <p className="m-0 font-semibold">Verification pending</p>
              <p className="m-0 mt-1">Additional checks may be required for business and payment verification.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
              <p className="m-0 font-semibold">Initial checks passed</p>
              <p className="m-0 mt-1">No action needed now. Final review continues.</p>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="m-0 font-semibold text-slate-900">SMS confirmation template</p>
            <p className="m-0 mt-1 text-slate-700">{smsTemplate}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link href="/login" className="btn-primary text-center no-underline">
            Go to Login
          </Link>
          <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-blue-300 px-4 text-sm font-bold text-blue-800 no-underline">
            Continue to Marketplace
          </Link>
        </div>

        <div className="mt-3">
          <Link href="/register/buyer/status" className="inline-flex min-h-11 items-center rounded-lg text-sm font-bold text-blue-700 no-underline hover:text-blue-800">
            Track buyer application status
          </Link>
        </div>
      </section>
    </AuthShell>
  );
}

export default function BuyerRegisterSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BuyerRegisterSuccessContent />
    </Suspense>
  );
}
