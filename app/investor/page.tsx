import Link from "next/link";

const highlights = [
  { metric: "30M+", label: "Addressable farmers in Nigeria" },
  { metric: "$400B+", label: "African agriculture market" },
  { metric: "2-5%", label: "Transaction commission model" },
];

export default function InvestorPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-5 py-6">
      <section className="card bg-gradient-to-r from-green-950 via-green-900 to-green-700 p-6 text-green-50">
        <p className="text-xs font-bold tracking-[0.2em] text-amber-200">INVESTOR RELATIONS</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Invest in the Digital Trade Infrastructure for Agriculture</h1>
        <p className="mt-3 max-w-3xl text-sm text-green-100 sm:text-base">
          DOS AGROLINK NIGERIA combines trade, pricing intelligence, logistics, storage, and finance into one integrated platform with measurable economic impact.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.metric} className="card p-5">
            <p className="text-3xl font-extrabold text-green-900">{item.metric}</p>
            <p className="mt-2 text-sm text-slate-700">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="text-2xl font-bold text-green-900">Where Capital Creates Impact</h2>
        <div className="mt-3 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <p>1. Product development for nationwide farmer onboarding and transaction growth.</p>
          <p>2. Logistics and storage expansion to cut post-harvest losses.</p>
          <p>3. Loan and wallet rails to unlock productive farm financing.</p>
          <p>4. Advisory intelligence to improve yield outcomes and decision quality.</p>
        </div>
        <Link href="/about-us" className="btn-primary mt-4 inline-flex items-center px-4 py-2 no-underline">Talk to Investor Relations</Link>
      </section>
    </main>
  );
}
