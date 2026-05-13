"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUsers, FaUserFriends, FaCheckCircle, FaHourglassHalf, FaShoppingCart,
  FaLeaf, FaBoxOpen, FaChartBar, FaCog, FaBell, FaSearch
} from "react-icons/fa";
import axios from "axios";

type Buyer = {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  businessType?: string;
  approved?: boolean;
  createdAt?: string;
};

type BuyerApplication = {
  _id: string;
  applicationId: string;
  status: string;
  account: { name: string; email: string; phone: string };
  application?: { businessType?: string; businessName?: string; location?: string };
  createdAt?: string;
};

const getAuthHeader = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeArray = <T,>(data: unknown, ...keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  for (const key of keys) {
    const val = (data as Record<string, unknown>)?.[key];
    if (Array.isArray(val)) return val as T[];
  }
  return [];
};

function NavItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
        isActive ? "bg-white/20 text-white" : "text-green-100 hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [applications, setApplications] = useState<BuyerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"applications" | "registered">("applications");

  useEffect(() => {
    const headers = getAuthHeader();
    if (!headers.Authorization) return;

    Promise.all([
      axios.get("/api/admin/users", { headers }),
      axios.get("/api/admin/buyer-applications", { headers }),
    ])
      .then(([usersRes, appsRes]) => {
        const allUsers = normalizeArray<Buyer>(usersRes.data, "users", "data");
        setBuyers(allUsers.filter(u => u.role === "buyer"));
        setApplications(normalizeArray<BuyerApplication>(appsRes.data, "applications", "data"));
      })
      .catch(err => console.error("Failed to fetch buyers data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleApproveApp = async (applicationId: string) => {
    setApprovingId(applicationId);
    try {
      await axios.patch(
        `/api/admin/buyer-applications/${applicationId}/approve`,
        {},
        { headers: getAuthHeader() }
      );
      setApplications(prev =>
        prev.map(a => a.applicationId === applicationId ? { ...a, status: "approved" } : a)
      );
    } catch {
      alert("Failed to approve buyer application.");
    } finally {
      setApprovingId(null);
    }
  };

  const q = search.toLowerCase();
  const filteredApps = applications.filter(a =>
    a.account?.name?.toLowerCase().includes(q) ||
    a.account?.email?.toLowerCase().includes(q) ||
    a.applicationId?.toLowerCase().includes(q)
  );
  const filteredBuyers = buyers.filter(b =>
    b.name?.toLowerCase().includes(q) ||
    b.email?.toLowerCase().includes(q)
  );

  const pendingApps = applications.filter(a => a.status === "pending" || a.status === "submitted");
  const approvedApps = applications.filter(a => a.status === "approved");

  return (
    <div className="flex min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-700">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-b from-green-900 to-green-700 text-white flex flex-col py-6 px-4 shadow-lg">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-white rounded-full p-1"><FaLeaf className="text-green-700 text-3xl" /></div>
          <span className="text-xl font-extrabold tracking-tight">Dos Agrolink</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<FaChartBar />} label="Dashboard" href="/admin" />
          <NavItem icon={<FaUserFriends />} label="Farmers" href="/admin/farmers" />
          <NavItem icon={<FaUsers />} label="Buyers" href="/admin/buyers" />
          <NavItem icon={<FaBoxOpen />} label="Products" href="/admin/products" />
          <NavItem icon={<FaShoppingCart />} label="Orders" href="/admin/orders" />
          <NavItem icon={<FaChartBar />} label="Analytics" href="/admin/analytics" />
          <NavItem icon={<FaCog />} label="Settings" href="/admin/settings" />
        </nav>
        <div className="mt-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-green-300 bg-green-600 flex items-center justify-center text-white font-bold">A</div>
          <span className="font-semibold">Admin</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-green-900">Buyers Management</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search buyers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 w-52"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button className="relative bg-white p-2 rounded-full shadow hover:bg-green-100">
              <FaBell className="text-green-700 text-lg" />
              {pendingApps.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <FaUsers className="text-blue-500 text-3xl" />
            <div>
              <p className="text-sm text-gray-500">Total Buyers</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? "…" : buyers.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <FaCheckCircle className="text-green-500 text-3xl" />
            <div>
              <p className="text-sm text-gray-500">Approved Applications</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? "…" : approvedApps.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <FaHourglassHalf className="text-amber-500 text-3xl" />
            <div>
              <p className="text-sm text-gray-500">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? "…" : pendingApps.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["applications", "registered"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                tab === t
                  ? "bg-green-700 text-white shadow"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-green-50"
              }`}
            >
              {t === "applications" ? `Applications (${filteredApps.length})` : `Registered Buyers (${filteredBuyers.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-green-700 font-semibold text-lg">Loading…</div>
        ) : tab === "applications" ? (
          /* Applications Tab */
          filteredApps.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">No buyer applications found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredApps.map(app => (
                <div key={app._id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-3 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{app.account?.name || "—"}</p>
                      <p className="text-sm text-gray-500">{app.account?.email}</p>
                      <p className="text-xs text-gray-400">{app.account?.phone}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        app.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p><span className="font-medium">ID:</span> {app.applicationId}</p>
                    {app.application?.businessName && (
                      <p><span className="font-medium">Business:</span> {app.application.businessName}</p>
                    )}
                    {app.application?.businessType && (
                      <p><span className="font-medium">Type:</span> {app.application.businessType}</p>
                    )}
                    {app.application?.location && (
                      <p><span className="font-medium">Location:</span> {app.application.location}</p>
                    )}
                    {app.createdAt && (
                      <p><span className="font-medium">Applied:</span> {new Date(app.createdAt).toLocaleDateString()}</p>
                    )}
                  </div>

                  {(app.status === "pending" || app.status === "submitted") && (
                    <button
                      onClick={() => handleApproveApp(app.applicationId)}
                      disabled={approvingId === app.applicationId}
                      className="mt-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                    >
                      {approvingId === app.applicationId ? "Approving…" : "Approve"}
                    </button>
                  )}
                  {app.status === "approved" && (
                    <div className="mt-auto flex items-center gap-2 text-green-600 text-sm font-semibold">
                      <FaCheckCircle /> Approved
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          /* Registered Buyers Tab */
          filteredBuyers.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">No registered buyers found.</div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-green-50 text-green-800">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Name</th>
                    <th className="py-3 px-4 text-left font-semibold">Email</th>
                    <th className="py-3 px-4 text-left font-semibold">Business Type</th>
                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                    <th className="py-3 px-4 text-left font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuyers.map((buyer, i) => (
                    <tr key={buyer._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-3 px-4 font-medium text-gray-800">{buyer.name}</td>
                      <td className="py-3 px-4 text-gray-600">{buyer.email || "—"}</td>
                      <td className="py-3 px-4 text-gray-600">{buyer.businessType || "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          buyer.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {buyer.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>
    </div>
  );
}
