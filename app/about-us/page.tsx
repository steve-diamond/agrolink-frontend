import Image from "next/image";
import Link from "next/link";

export default function AboutUsPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-6 py-6">
      <section className="card overflow-hidden">
        <div className="relative min-h-[260px] sm:min-h-[320px]">
          <Image
            src="/agropro/images/about_img1.jpg"
            alt="Farming community"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/85 via-green-900/55 to-transparent" />
          <div className="relative z-10 max-w-3xl p-6 text-green-50 sm:p-8">
            <p className="text-xs font-bold tracking-[0.18em] text-amber-200">ABOUT DOS AGROLINK NIGERIA</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl">A trusted agricultural operating ecosystem for Nigeria.</h1>
            <p className="mt-3 text-sm text-green-100 sm:text-base">
              We connect farmers, buyers, logistics, storage, and finance so every actor in the value chain can make better decisions and grow sustainably.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-5">
          <h2 className="text-xl font-bold text-green-900">Our Mission</h2>
          <p className="mt-2 text-sm text-slate-700">
            Increase farmer income by removing market friction and giving direct access to transparent trade opportunities.
          </p>
        </article>
        <article className="card p-5">
          <h2 className="text-xl font-bold text-green-900">Our Vision</h2>
          <p className="mt-2 text-sm text-slate-700">
            Build the digital backbone for agricultural trade in Nigeria and across Africa with trust, inclusion, and measurable impact.
          </p>
        </article>
        <article className="card p-5">
          <h2 className="text-xl font-bold text-green-900">Our Promise</h2>
          <p className="mt-2 text-sm text-slate-700">
            Data-backed pricing, secure transactions, faster movement of produce, and stronger post-harvest outcomes.
          </p>
        </article>
      </section>

      <section className="card p-5">
        <h2 className="text-2xl font-bold text-green-900">Platform Capabilities</h2>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm text-slate-700 md:grid-cols-2">
          <li>Smart Produce Marketplace</li>
          <li>AI Crop Price Intelligence</li>
          <li>Cooperative Digital Wallet</li>
          <li>Farmer Micro-Loan System</li>
          <li>Logistics and Transport Network</li>
          <li>Warehouse and Storage System</li>
          <li>Agricultural Knowledge and Advisory Hub</li>
        </ul>
        <Link href="/marketplace" className="btn-primary mt-4 inline-flex items-center px-4 py-2 no-underline">Explore Marketplace</Link>
      </section>
    </main>
  );
}
