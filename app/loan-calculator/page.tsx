"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";

const LoanCalculator = dynamic(
  () => import("@/components/loan/LoanCalculator").then((m) => ({ default: m.LoanCalculator })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[520px] w-full rounded-2xl" />,
  },
);

export default function LoanCalculatorPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">
          FARMER FINANCE
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-green-900">
          Loan Calculator
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Estimate your monthly repayments, total interest and affordability
          before you apply.
        </p>
      </div>

      <LoanCalculator
        onApply={(amount, period) => {
          router.push(
            `/loan-application?amount=${amount}&period=${period}`,
          );
        }}
      />
    </main>
  );
}
