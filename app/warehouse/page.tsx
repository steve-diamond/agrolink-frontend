"use client";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { getStorage, Storage } from "@services/warehouseService";

export default function WarehousePage() {
  const [storage, setStorage] = useState<Storage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const pageSize = 10;

  // Release storage handler
  const handleReleaseStorage = useCallback(async (storageId: string) => {
    if (!window.confirm("Are you sure you want to release this storage record?")) return;
    setReleasingId(storageId);
    try {
      await fetch(`/api/warehouse/${storageId}/release`, { method: "POST" });
      setStorage((prev) => prev.map((s) => s._id === storageId ? { ...s, released: true } : s));
    } catch (err) {
      alert("Failed to release storage. Please try again.");
    } finally {
      setReleasingId(null);
    }
  }, []);

  useEffect(() => {
    // Try to get user from localStorage (same as dashboard)
    const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let userId = "";
    try {
      if (rawUser) userId = JSON.parse(rawUser)._id;
    } catch {}
    getStorage(userId)
      .then(setStorage)
      .finally(() => setLoading(false));
  }, []);

  const uniqueWarehouses = Array.from(new Set(storage.map((s) => s.warehouse)));
  const filteredStorage = storage.filter((s) => {
    const matchesSearch =
      search.trim() === "" ||
      s.commodity.toLowerCase().includes(search.toLowerCase()) ||
      s.warehouse.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse = !warehouseFilter || s.warehouse === warehouseFilter;
    return matchesSearch && matchesWarehouse;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStorage.length / pageSize) || 1;
  const paginatedStorage = filteredStorage.slice((page - 1) * pageSize, page * pageSize);

  // Reset to page 1 if filters/search change
  useEffect(() => { setPage(1); }, [search, warehouseFilter]);

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

      <section className="flex flex-wrap gap-3 items-center mb-2">
        <input
          type="text"
          placeholder="Search by commodity or warehouse..."
          className="border rounded px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 text-sm"
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
        >
          <option value="">All Warehouses</option>
          {uniqueWarehouses.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </section>

      <section className="card p-5 w-full">
        <h2 className="font-bold text-green-900 mb-2">Your Storage Records</h2>
        {loading ? (
          <p className="text-slate-600">Loading storage records...</p>
        ) : paginatedStorage.length === 0 ? (
          <p className="text-slate-600">No storage records found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Commodity</th>
                    <th className="px-2 py-1 text-left">Quantity (kg)</th>
                    <th className="px-2 py-1 text-left">Warehouse</th>
                    <th className="px-2 py-1 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStorage.map((s) => (
                    <tr key={s._id} className="border-b last:border-0">
                      <td className="px-2 py-1">{s.commodity}</td>
                      <td className="px-2 py-1">{s.quantityKg.toLocaleString()}</td>
                      <td className="px-2 py-1">{s.warehouse}</td>
                      <td className="px-2 py-1 flex items-center gap-2">{new Date(s.createdAt).toLocaleDateString()}
                        {!s.released && (
                          <button
                            className="ml-2 px-2 py-1 border border-red-400 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                            disabled={releasingId === s._id}
                            onClick={() => handleReleaseStorage(s._id)}
                          >
                            {releasingId === s._id ? "Releasing..." : "Release Storage"}
                          </button>
                        )}
                        {s.released && <span className="ml-2 text-xs text-red-500 font-semibold">Released</span>}
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
