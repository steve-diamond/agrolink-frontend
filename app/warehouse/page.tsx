export default function WarehousePage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-5 py-6">
      <section className="card p-5">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">WAREHOUSE SYSTEM</p>
        <h1 className="mt-2 text-3xl font-extrabold text-green-900">Storage & Inventory Management</h1>
        <p className="mt-2 text-sm text-slate-700">
          Book warehouse space, track inventory, manage receipts, and reduce distress selling during low-price cycles.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-4"><h2 className="font-bold text-green-900">Warehouse Booking</h2><p className="mt-2 text-sm text-slate-700">Capacity-aware storage booking flow.</p></article>
        <article className="card p-4"><h2 className="font-bold text-green-900">Inventory Tracking</h2><p className="mt-2 text-sm text-slate-700">Commodity quantities and ownership records.</p></article>
        <article className="card p-4"><h2 className="font-bold text-green-900">Warehouse Receipts</h2><p className="mt-2 text-sm text-slate-700">Traceable storage records for financing confidence.</p></article>
      </section>
    </main>
  );
}
