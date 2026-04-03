"use client";

import { useState } from "react";

export default function LoanApplicationPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="mx-auto grid max-w-4xl gap-5 py-6">
      <section className="card p-5">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">FARMER FINANCE</p>
        <h1 className="mt-2 text-3xl font-extrabold text-green-900">Loan Application</h1>
        <p className="mt-2 text-sm text-slate-700">
          Apply for working capital to buy seeds, fertilizer, farm equipment, and expand productivity.
        </p>
      </section>

      <section className="card p-5">
        {submitted ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Loan request captured successfully. Our team will review your profile and contact you.
          </div>
        ) : null}

        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <input required placeholder="Loan Amount (NGN)" type="number" min={1} />
          <input required placeholder="Purpose (e.g., seeds, tractor, fertilizer)" />
          <input placeholder="Farm Size (hectares)" type="number" min={0} step="0.1" />
          <input placeholder="Requested Term (months)" type="number" min={1} />
          <button className="btn-primary touch-target" type="submit">Submit Loan Application</button>
        </form>
      </section>
    </main>
  );
}
