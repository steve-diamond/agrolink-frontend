import Link from "next/link";

export default function ProductListingPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-5 py-6">
      <section className="card p-5">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">PRODUCT LISTING</p>
        <h1 className="mt-2 text-3xl font-extrabold text-green-900">Manage Farm Product Listings</h1>
        <p className="mt-2 text-sm text-slate-700">
          Create and manage approved produce listings with quantity, quality, location, and pricing details.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card p-4">
          <h2 className="text-xl font-bold text-green-900">For Farmers</h2>
          <p className="mt-2 text-sm text-slate-700">Upload new produce and keep inventory current for trusted buyer visibility.</p>
          <Link href="/farmer/upload" className="btn-primary mt-4 inline-flex px-4 py-2 no-underline">Upload Product</Link>
        </article>
        <article className="card p-4">
          <h2 className="text-xl font-bold text-green-900">For Buyers</h2>
          <p className="mt-2 text-sm text-slate-700">Browse verified produce listings and make purchase decisions with confidence.</p>
          <Link href="/marketplace" className="btn-primary mt-4 inline-flex px-4 py-2 no-underline">Browse Marketplace</Link>
        </article>
      </section>
    </main>
  );
}
