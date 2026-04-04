import Link from "next/link";

export default function JoinUsPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-6 py-6">
      <section className="card bg-gradient-to-r from-green-950 via-green-900 to-green-700 p-6 text-green-50">
        <p className="text-xs font-bold tracking-[0.2em] text-amber-200">JOIN DOS AGROLINK NIGERIA</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Build a stronger farming business with us</h1>
        <p className="mt-3 max-w-3xl text-sm text-green-100 sm:text-base">
          Join the platform to access transparent markets, price intelligence, logistics, storage, financing pathways,
          and practical advisory support tailored to Nigerian agriculture.
        </p>
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
          <Link href="/register" className="btn-primary inline-flex items-center px-4 py-2 no-underline">Create Account</Link>
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
