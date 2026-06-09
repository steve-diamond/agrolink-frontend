import Link from "next/link";

export default function JoinUsPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6">
      <section className="relative overflow-hidden rounded-2xl border border-green-800/40 bg-linear-to-r from-green-950 via-green-900 to-green-700 p-6 text-white shadow-lg sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.16),transparent_36%),radial-gradient(circle_at_90%_0%,rgba(163,230,53,0.20),transparent_32%)]" aria-hidden="true" />
        <div className="relative">
          <p className="text-xs font-bold tracking-[0.2em] text-amber-300">JOIN DOS AGROLINK NIGERIA</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-5xl">Build a stronger farming business with us</h1>
          <p className="mt-4 max-w-3xl text-sm text-green-100/95 sm:text-xl">
            Join the platform to access transparent markets, price intelligence, logistics, storage, financing pathways,
            and practical advisory support tailored to Nigerian agriculture.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-5">
          <h2 className="text-xl font-bold text-green-900">Farmers</h2>
          <p className="mt-2 text-sm text-slate-700">
            Sell directly, reduce losses, and improve planning with market and advisory intelligence.
          </p>
        </article>
        <article className="card p-5">
          <h2 className="text-xl font-bold text-green-900">Buyers</h2>
          <p className="mt-2 text-sm text-slate-700">
            Source verified produce, track fulfillment, and build reliable supply partnerships.
          </p>
        </article>
        <article className="card p-5">
          <h2 className="text-xl font-bold text-green-900">Cooperatives & Partners</h2>
          <p className="mt-2 text-sm text-slate-700">
            Coordinate finance, logistics, and storage to scale agricultural value creation.
          </p>
        </article>
      </section>

      <section className="card p-5">
        <h2 className="text-2xl font-bold text-green-900">Start Here</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/register/select-role" className="btn-primary inline-flex items-center px-4 py-2 no-underline">Choose Your Role</Link>
          <Link href="/register" className="inline-flex items-center rounded-full border border-green-300 px-4 py-2 text-sm font-bold text-green-800 no-underline">Register as Farmer</Link>
          <Link href="/vision" className="inline-flex items-center rounded-full border border-green-300 px-4 py-2 text-sm font-bold text-green-800 no-underline">
            Explore 7-Point Vision
          </Link>
          <Link href="/marketplace" className="inline-flex items-center rounded-full border border-green-300 px-4 py-2 text-sm font-bold text-green-800 no-underline">
            Visit Marketplace
          </Link>
        </div>
      </section>
    </main>
  );
}
