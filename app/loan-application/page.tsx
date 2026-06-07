"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

const LoanApplicationWizard = dynamic(
  () =>
    import("@/components/loan/LoanApplicationWizard").then((m) => ({
      default: m.LoanApplicationWizard,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-150 w-full rounded-2xl" />,
  },
);

export default function LoanApplicationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">
          FARMER FINANCE
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-green-900">
          Loan Application
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Complete the 5-step process to apply for agricultural financing.
          Your progress is auto-saved.
        </p>
      </div>

      <div className="card p-6">
        <LoanApplicationWizard />
      </div>
    </main>
  );
}
