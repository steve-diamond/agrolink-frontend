export default function LogisticsPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-5 py-6">
      <section className="card p-5">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">LOGISTICS NETWORK</p>
        <h1 className="mt-2 text-3xl font-extrabold text-green-900">Produce Transport Coordination</h1>
        <p className="mt-2 text-sm text-slate-700">
          Coordinate pickup, driver assignment, transit status, and delivery confirmation from farm to buyer destination.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="card p-4"><h2 className="font-bold text-green-900">1. Buyer Orders</h2><p className="mt-2 text-sm text-slate-700">Orders trigger fulfillment workflows.</p></article>
        <article className="card p-4"><h2 className="font-bold text-green-900">2. Pickup Request</h2><p className="mt-2 text-sm text-slate-700">Farmer requests transport instantly.</p></article>
        <article className="card p-4"><h2 className="font-bold text-green-900">3. Driver Assigned</h2><p className="mt-2 text-sm text-slate-700">Admin assigns available logistics partner.</p></article>
        <article className="card p-4"><h2 className="font-bold text-green-900">4. Delivery Tracked</h2><p className="mt-2 text-sm text-slate-700">Status is updated to delivered with traceability.</p></article>
      </section>
    </main>
  );
}
