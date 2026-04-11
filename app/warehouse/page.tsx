export default function WarehousePage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-4 sm:gap-5 py-4 sm:py-6 px-2 sm:px-0">
      <header className="flex items-center gap-3 mb-4">
        <Image src="/dos-agrolink-logo.png" alt="DOS Agrolink Logo" width={40} height={40} className="rounded-lg shadow" priority />
        <span className="text-lg font-extrabold text-green-900 tracking-tight">DOS AGROLINK</span>
      </header>
      <section className="card p-4 sm:p-5 w-full">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">WAREHOUSE SYSTEM</p>
        <h1 className="mt-2 text-3xl font-extrabold text-green-900">Storage & Inventory Management</h1>
        <p className="mt-2 text-sm text-slate-700">
          Book warehouse space, track inventory, manage receipts, and reduce distress selling during low-price cycles.
        </p>
      </section>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-3 w-full">
        <article className="card p-4"><h2 className="font-bold text-green-900">Warehouse Booking</h2><p className="mt-2 text-sm text-slate-700">Capacity-aware storage booking flow.</p></article>
        <article className="card p-4"><h2 className="font-bold text-green-900">Inventory Tracking</h2><p className="mt-2 text-sm text-slate-700">Commodity quantities and ownership records.</p></article>
        <article className="card p-4"><h2 className="font-bold text-green-900">Warehouse Receipts</h2><p className="mt-2 text-sm text-slate-700">Traceable storage records for financing confidence.</p></article>
      </section>
    </main>
  );
}
