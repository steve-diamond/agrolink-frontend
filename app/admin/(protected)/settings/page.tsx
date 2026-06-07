"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  FaUserFriends, FaUsers, FaShoppingCart, FaBoxOpen,
  FaChartBar, FaCog, FaBell, FaCheckCircle
} from "react-icons/fa";

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

type SaveStatus = "idle" | "saving" | "saved";

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("Dos Agrolink");
  const [supportEmail, setSupportEmail] = useState("support@dosagrolink.com");
  const [maxProductsPerFarmer, setMaxProductsPerFarmer] = useState("50");
  const [requireApproval, setRequireApproval] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    // Simulate save — replace with real API call when backend endpoint is ready
    await new Promise(r => setTimeout(r, 800));
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  return (
    <div className="flex min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-700">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-b from-green-900 to-green-700 text-white flex flex-col py-6 px-4 shadow-lg">
        <div className="flex items-center gap-3 mb-10">
          <OptimizedImage
            src="/dos-agrolink-logo.jpg"
            alt="Dos Agrolink"
            width={40}
            height={40}
            priority
            sizesContext="logo"
            className="rounded-full object-cover border-2 border-white/50"
          />
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

      {/* Main */}
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-green-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Platform configuration</p>
          </div>
          <button className="bg-white p-2 rounded-full shadow hover:bg-green-100" aria-label="Notifications">
            <FaBell className="text-green-700 text-lg" />
          </button>
        </header>

        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          {/* General */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={e => setPlatformName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Products per Farmer</label>
                <input
                  type="number"
                  min={1}
                  value={maxProductsPerFarmer}
                  onChange={e => setMaxProductsPerFarmer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Moderation */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Moderation</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Require admin approval for new products</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={requireApproval}
                  onClick={() => setRequireApproval(v => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${requireApproval ? "bg-green-600" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${requireApproval ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Maintenance mode (disables public access)</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={maintenanceMode}
                  onClick={() => setMaintenanceMode(v => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${maintenanceMode ? "bg-amber-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${maintenanceMode ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </label>
            </div>
          </section>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saveStatus === "saving"}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {saveStatus === "saving" ? "Saving..." : "Save Changes"}
            </button>
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <FaCheckCircle /> Saved successfully
              </span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
