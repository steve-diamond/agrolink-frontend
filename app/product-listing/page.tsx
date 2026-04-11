import Link from "next/link";
import Image from "next/image";

export default function ProductListingPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-4 sm:gap-5 py-4 sm:py-6 px-2 sm:px-0">
      <header className="flex items-center gap-3 mb-4">
        <Image src="/dos-agrolink-logo.png" alt="DOS Agrolink Logo" width={40} height={40} className="rounded-lg shadow" priority />
        <span className="text-lg font-extrabold text-green-900 tracking-tight">DOS AGROLINK</span>
      </header>
      <section className="card p-4 sm:p-5 w-full">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">PRODUCT LISTING</p>
        <h1 className="mt-2 text-3xl font-extrabold text-green-900">Manage Farm Product Listings</h1>
        <p className="mt-2 text-sm text-slate-700">
          Create and manage approved produce listings with quantity, quality, location, and pricing details.
        </p>
      </section>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
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
