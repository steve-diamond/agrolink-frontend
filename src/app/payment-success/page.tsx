"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import API from "@/services/api";

export default function PaymentSuccess() {
  const params = useSearchParams();

  useEffect(() => {
    const reference = params.get("reference");

    if (reference) {
      API.get(`/api/payment/verify/${reference}`)
        .then(() => alert("Payment verified"))
        .catch(() => alert("Verification failed"));
    }
  }, []);

  return <h1>Processing payment...</h1>;
}
