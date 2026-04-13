"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthShell from "../../_components/AuthShell";

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Farmer";
  const appId = searchParams.get("appId") || "AGR-000000";
  const queued = searchParams.get("queued") === "1";
  const kycPending = searchParams.get("kycPending") === "1";

  const smsTemplate = `Your Dos Agrolink farmer ID is ${appId}. Use this to log in. Welcome!`;

  return (
    <AuthShell
      eyebrow="Application Complete"
      title="Thank you for joining Dos Agrolink"
      subtitle="Your farmer application has been received and is being reviewed."
      bullets={[
        "Review window: within 24 hours",
        "SMS confirmation sent to your phone",
        "You can continue onboarding in the app",
      ]}
      imageA={{ src: "/agropro/images/service2.jpg", alt: "Smiling farmer holding fresh produce" }}
      imageB={{ src: "/agropro/images/news2.jpg", alt: "Agri supply operations overview" }}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <p className="m-0 text-sm font-semibold">Thank you, {name}!</p>
          <p className="m-0 mt-1 text-sm">Your application is being reviewed. You will get an SMS within 24 hours.</p>
        </div>

        <div className="grid gap-3 text-sm text-slate-700">
          <div className="rounded-lg border border-green-100 bg-green-50 p-3">
            <p className="m-0 font-semibold text-green-900">Farmer ID</p>
            <p className="m-0 mt-1 text-lg font-bold text-green-800">{appId}</p>
          </div>

          {queued ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <p className="m-0 font-semibold">Submission queued</p>
              <p className="m-0 mt-1">We saved your form offline and will submit automatically once your internet is stable.</p>
            </div>
          ) : null}

          {kycPending ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <p className="m-0 font-semibold">KYC needs one more step</p>
              <p className="m-0 mt-1">Your ID upload needs a retry. Please log in and upload a clearer ID photo.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
              <p className="m-0 font-semibold">KYC looks good</p>
              <p className="m-0 mt-1">No extra action needed now. We will notify you by SMS after review.</p>
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
          <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-green-300 px-4 text-sm font-bold text-green-800 no-underline">
            Download Dos Agrolink App
          </Link>
        </div>

        <div className="mt-3">
          <Link href="/register/status" className="inline-flex min-h-11 items-center rounded-lg text-sm font-bold text-green-700 no-underline hover:text-green-800">
            Track application status
          </Link>
        </div>
      </section>
    </AuthShell>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={null}>
      <RegisterSuccessContent />
    </Suspense>
  );
}
