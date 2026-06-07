"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import API from "@services/api";
import { useAnalytics } from "@/hooks/useAnalytics";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const { trackPurchase, trackError } = useAnalytics();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const reference = params.get("reference");

    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }

    API.get(`/api/payment/verify/${reference}`)
      .then((res) => {
        const data = (res as { data: { status: string; amount?: number; transactionId?: string } }).data;
        if (data.status === "success") {
          setStatus("success");
          setMessage("Payment verified! Your order is confirmed.");
          trackPurchase({
            transaction_id: data.transactionId || reference,
            value: Number(data.amount || 0),
            currency: "NGN",
          });
        } else {
          setStatus("failed");
          setMessage("Payment was not successful. Please try again.");
        }
      })
      .catch((error) => {
        trackError(error, { module: "payment_success", action: "verify" });
        setStatus("failed");
        setMessage("Verification failed. Please contact support.");
      });
  }, [params, trackPurchase, trackError]);

  const headingColorClass =
    status === "success"
      ? "text-green-600"
      : status === "failed"
      ? "text-red-600"
      : "text-gray-600";

  return (
    <main className="mx-auto w-full max-w-120 px-4 py-6 text-center">
      <div className="mb-6 flex items-center justify-center gap-3">
        <Image
          src="/dos-agrolink-logo.png"
          alt="DOS Agrolink Logo"
          width={38}
          height={38}
          className="rounded-lg shadow-sm shadow-emerald-100"
          priority
        />
        <span className="text-[22px] font-extrabold tracking-tight text-green-800">DOS AGROLINK</span>
      </div>
      <h1 className={headingColorClass}>
        {status === "loading" && "Processing Payment..."}
        {status === "success" && "Payment Successful!"}
        {status === "failed" && "Payment Failed"}
      </h1>
      <p className="mt-4 text-gray-700">{message}</p>
      {status !== "loading" && (
        <a
          href="/marketplace"
          className="mx-auto mt-8 block w-full max-w-80 rounded-lg bg-green-600 px-5 py-2.5 text-white no-underline hover:bg-green-700"
        >
          Back to Marketplace
        </a>
      )}
    </main>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
