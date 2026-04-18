"use client";
import { useEffect, useState, useCallback } from "react";
import { getShipments, Shipment } from "@services/logisticsService";

export default function LogisticsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const pageSize = 10;

  // Cancel shipment handler
  const handleCancelShipment = useCallback(async (shipmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this shipment?")) return;
    setCancellingId(shipmentId);
    try {
      await fetch(`/api/logistics/${shipmentId}/cancel`, { method: "POST" });
      setShipments((prev) => prev.map((s) => s._id === shipmentId ? { ...s, status: "cancelled" } : s));
    } catch {
      alert("Failed to cancel shipment. Please try again.");
    } finally {
      setCancellingId(null);
    }
  }, []);

  useEffect(() => {
    // Try to get user from localStorage (same as dashboard)
    const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let userId = "";
    try {
      if (rawUser) userId = JSON.parse(rawUser)._id;
    } catch {}
    getShipments(userId)
      .then(setShipments)
      .finally(() => setLoading(false));
  }, []);

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      search.trim() === "" ||
      s.from.toLowerCase().includes(search.toLowerCase()) ||
      s.to.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredShipments.length / pageSize) || 1;
  const paginatedShipments = filteredShipments.slice((page - 1) * pageSize, page * pageSize);

  // Reset to page 1 if filters/search change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  return (
    <main className="mx-auto grid max-w-5xl gap-5 py-6">
      <section className="flex flex-wrap gap-3 items-center mb-2">
        <input
          type="text"
          placeholder="Search by origin or destination..."
          className="border rounded px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>
      </section>

      <section className="card p-5">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">LOGISTICS NETWORK</p>
        <h1 className="mt-2 text-3xl font-extrabold text-green-900">Produce Transport Coordination</h1>
        <p className="mt-2 text-sm text-slate-700">
          Coordinate pickup, driver assignment, transit status, and delivery confirmation from farm to buyer destination.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="font-bold text-green-900 mb-2">Your Shipments</h2>
        {loading ? (
          <p className="text-slate-600">Loading shipments...</p>
        ) : paginatedShipments.length === 0 ? (
          <p className="text-slate-600">No shipments found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Status</th>
                    <th className="px-2 py-1 text-left">From</th>
                    <th className="px-2 py-1 text-left">To</th>
                    <th className="px-2 py-1 text-left">Estimated Arrival</th>
                    <th className="px-2 py-1 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedShipments.map((s) => (
                    <tr key={s._id} className="border-b last:border-0">
                      <td className="px-2 py-1">{s.status.replace(/_/g, " ")}</td>
                      <td className="px-2 py-1">{s.from}</td>
                      <td className="px-2 py-1">{s.to}</td>
                      <td className="px-2 py-1">{new Date(s.estimatedArrival).toLocaleDateString()}</td>
                      <td className="px-2 py-1 flex items-center gap-2">{new Date(s.createdAt).toLocaleDateString()}
                        {s.status === "in_transit" && (
                          <button
                            className="ml-2 px-2 py-1 border border-red-400 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                            disabled={cancellingId === s._id}
                            onClick={() => handleCancelShipment(s._id)}
                          >
                            {cancellingId === s._id ? "Cancelling..." : "Cancel Shipment"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-green-700 text-white" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
