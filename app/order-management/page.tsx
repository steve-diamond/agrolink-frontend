import Link from "next/link";

export default function OrderManagementPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-5 py-6">
      <section className="card p-5">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">ORDER MANAGEMENT</p>
        <h1 className="mt-2 text-3xl font-extrabold text-green-900">Track and Manage Orders</h1>
        <p className="mt-2 text-sm text-slate-700">
          Monitor order states from pending to delivered with stronger visibility across buyer, farmer, and logistics teams.
        </p>
      </section>

      <section className="card p-5">
        <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-4">
          <p>Pending Orders</p>
          <p>Paid Orders</p>
          <p>Shipped Orders</p>
          <p>Delivered Orders</p>
        </div>
        <Link href="/orders" className="btn-primary mt-4 inline-flex px-4 py-2 no-underline">Open Orders Page</Link>
      </section>
    </main>
  );
}
