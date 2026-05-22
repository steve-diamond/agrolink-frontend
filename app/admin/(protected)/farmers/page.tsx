"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUserFriends, FaUsers, FaCheckCircle, FaHourglassHalf, FaShoppingCart,
  FaLeaf, FaBoxOpen, FaChartBar, FaCog, FaBell, FaSearch, FaBan
} from "react-icons/fa";
import axios from "axios";

type Farmer = {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  category?: string;
  approved?: boolean;
  createdAt?: string;
};

type FarmerApplication = {
  _id: string;
  applicationId: string;
  status: string;
  account: { name: string; email: string; phone: string };
  application?: { farmerCategory?: string; farmSize?: string; farmLocation?: string };
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

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [applications, setApplications] = useState<FarmerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"registered" | "applications">("applications");

  useEffect(() => {
    const headers = getAuthHeader();
    if (!headers.Authorization) return;

    Promise.all([
      axios.get("/api/admin/users", { headers }),
      axios.get("/api/admin/farmer-applications", { headers }),
    ])
      .then(([usersRes, appsRes]) => {
        const allUsers = normalizeArray<Farmer>(usersRes.data, "users", "data");
        setFarmers(allUsers.filter(u => u.role === "farmer" || u.role === undefined));
        setApplications(normalizeArray<FarmerApplication>(appsRes.data, "applications", "data"));
      })
      .catch(err => console.error("Failed to fetch farmers data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleApproveApp = async (applicationId: string) => {
    setApprovingId(applicationId);
    try {
      await axios.patch(
        `/api/admin/farmer-applications/${applicationId}/approve`,
        {},
        { headers: getAuthHeader() }
      );
      setApplications(prev =>
        prev.map(a => a.applicationId === applicationId ? { ...a, status: "approved" } : a)
      );
    } catch {
      alert("Failed to approve farmer application.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectApp = async (applicationId: string) => {
    if (!confirm("Reject this farmer application? This marks it as unlawful/invalid.")) return;
    setRejectingId(applicationId);
    try {
      await axios.patch(
        `/api/admin/farmer-applications/${applicationId}/reject`,
        {},
        { headers: getAuthHeader() }
      );
      setApplications(prev =>
        prev.map(a => a.applicationId === applicationId ? { ...a, status: "rejected" } : a)
      );
    } catch {
      alert("Failed to reject farmer application.");
    } finally {
      setRejectingId(null);
    }
  };

  const filteredFarmers = farmers.filter(f =>
    !search ||
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredApps = applications.filter(a =>
    !search ||
    a.account.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.account.email?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = applications.filter(a => a.status === "pending" || a.status === "submitted").length;

  return (
    <div className="flex min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-700">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-b from-green-900 to-green-700 text-white flex flex-col py-6 px-4 shadow-lg">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-white rounded-full p-1">
            <FaLeaf className="text-green-700 text-3xl" />
          </div>
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
          <div className="w-10 h-10 rounded-full border-2 border-green-300 bg-green-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-semibold">Admin</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-green-900">Farmers</h1>
            <p className="text-sm text-gray-500 mt-1">Manage registered farmers and applications</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search farmers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all w-52"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
            </div>
            <button className="relative bg-white p-2 rounded-full shadow hover:bg-green-100" aria-label="Notifications">
              <FaBell className="text-green-700 text-lg" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <FaUserFriends className="text-green-600 text-3xl" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Registered Farmers</p>
              <p className="text-2xl font-bold text-gray-800">{farmers.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <FaCheckCircle className="text-emerald-500 text-3xl" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Approved</p>
              <p className="text-2xl font-bold text-gray-800">{farmers.filter(f => f.approved).length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <FaHourglassHalf className="text-amber-500 text-3xl" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTab("applications")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "applications"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Applications
            {pendingCount > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
          <button
            onClick={() => setTab("registered")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "registered"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Registered Farmers
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : tab === "applications" ? (
          <section>
            {filteredApps.length === 0 ? (
              <p className="text-gray-500 text-sm">No farmer applications found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApps.map(app => (
                  <div
                    key={app._id}
                    className={`bg-white shadow rounded-xl p-4 border-l-4 ${
                      app.status === "approved" ? "border-green-500" : "border-amber-500"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{app.account.name}</p>
                        <p className="text-sm text-gray-500">{app.account.email}</p>
                        <p className="text-sm text-gray-500">{app.account.phone}</p>
                      </div>
                      {app.status === "approved" ? (
                        <FaCheckCircle className="text-green-500 text-xl shrink-0" />
                      ) : (
                        <FaHourglassHalf className="text-amber-500 text-xl shrink-0" />
                      )}
                    </div>
                    {app.application?.farmerCategory && (
                      <p className="text-xs text-gray-400 mb-1">Category: {app.application.farmerCategory}</p>
                    )}
                    {app.application?.farmLocation && (
                      <p className="text-xs text-gray-400 mb-1">Location: {app.application.farmLocation}</p>
                    )}
                    <p className="text-xs text-gray-400 mb-3">ID: {app.applicationId}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs rounded-full px-2 py-0.5 capitalize ${
                          app.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : app.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {app.status}
                      </span>
                      {(app.status === "pending" || app.status === "submitted") && (
                        <>
                          <button
                            disabled={approvingId === app.applicationId || rejectingId === app.applicationId}
                            onClick={() => handleApproveApp(app.applicationId)}
                            className="ml-auto bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 font-semibold disabled:opacity-60"
                          >
                            {approvingId === app.applicationId ? "Approving..." : "Approve"}
                          </button>
                          <button
                            disabled={approvingId === app.applicationId || rejectingId === app.applicationId}
                            onClick={() => handleRejectApp(app.applicationId)}
                            className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 font-semibold disabled:opacity-60"
                          >
                            <FaBan className="text-[10px]" />
                            {rejectingId === app.applicationId ? "Rejecting..." : "Reject"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            {filteredFarmers.length === 0 ? (
              <p className="text-gray-500 text-sm">No registered farmers found.</p>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-green-50 text-green-900 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFarmers.map(farmer => (
                      <tr key={farmer._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{farmer.name}</td>
                        <td className="px-4 py-3 text-gray-500">{farmer.email || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{farmer.category || "—"}</td>
                        <td className="px-4 py-3">
                          {farmer.approved ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                              <FaCheckCircle className="text-[10px]" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                              <FaHourglassHalf className="text-[10px]" /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
