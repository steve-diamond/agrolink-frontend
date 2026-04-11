
"use client";

// ...existing imports here...

// ...type definitions here...

export default function AdminProtectedPage() {
  // ...all hooks, state, and logic here...

  // ...existing code...

  return (
    <>
      {/* ...all JSX including withdrawals table, audit log, analytics, etc. goes here... */}
    </>
  );
}

type AdminOrder = {
  _id: string;
  totalPrice: number;
  totalAmount?: number;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
  buyerId?: {
    name?: string;
    email?: string;
  };
  productId?: {
    _id?: string;
    name?: string;
    price?: number;
    location?: string;
  };
  products?: Array<{
    productId?: {
      _id?: string;
      name?: string;
      price?: number;
      location?: string;
    };
    quantity: number;
  }>;
  quantity?: number;
};

type AdminFarmerApplication = {
  _id?: string;
  applicationId: string;
  status: "draft" | "pending" | "approved" | "rejected" | "queued";
  account?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  createdAt?: string;
};

type FarmerProfile = {
  id: string;
  name: string;
  email: string;
  category: string;
  approved: boolean;
  farmSize: string;
  capacity: string;
};

const FARMER_CATEGORIES = ["Arable", "Livestock", "Horticultural", "Poultry", "Fish", "Organic", "Dairy", "Mixed"] as const;
const ORDER_STATUSES = ["Pending", "Shipped", "Delivered"] as const;

const ADMIN_MODULES: ModuleKey[] = [
  "dashboard",
  "farmers",
  "products",
  "orders",
  "withdrawals",
  "analytics",
  "notifications",
  "auditlog",
  "settings",
];

const SIDE_NAV_ITEMS: Array<{ key: ModuleKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "farmers", label: "Farmers" },
  { key: "products", label: "Products" },
  { key: "orders", label: "Orders" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "analytics", label: "Analytics" },
  { key: "notifications", label: "Notifications" },
  { key: "auditlog", label: "Audit Log" },
  { key: "settings", label: "Settings" },
];

const SIDE_NAV_ICON: Record<ModuleKey, JSX.Element> = {
  dashboard: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" /></svg>
  ),
  farmers: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ),
  products: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700"><rect width="18" height="14" x="3" y="7" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4" /></svg>
  ),
  orders: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4" /></svg>
  ),
  analytics: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19V6m4 13V10m-8 9v-4" /></svg>
  ),
  notifications: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
  ),
  auditlog: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700"><rect x="4" y="4" width="16" height="16" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8M8 13h6M8 17h4" /></svg>
  ),
  settings: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
  ),
};


// --- Notifications Center State ---
type Notification = { id: string; message: string; type: string; createdAt: string };
const NOTIF_TYPES = { info: "Info", success: "Success", warning: "Warning", error: "Error" };

// --- Audit Log State ---
type AuditLogEntry = { id: string; action: string; user: string; target: string; timestamp: string };

const chartTooltipStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 10,
  color: "#e2e8f0",
} as const;

const getAuthHeaders = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
};
                                <tbody>
                                  {auditLog.length === 0 ? (
                                    <tr><td colSpan={4} className="text-slate-500 py-4 text-center">No audit log entries.</td></tr>
                                  ) : (
                                    auditLog.map((entry) => (
                                      <tr key={entry.id} className="border-b last:border-b-0 hover:bg-green-50/40 transition">
                                        <td className="py-2 px-3 font-medium flex items-center gap-2">
                                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold">
                                            {entry.user?.name?.[0]?.toUpperCase() || entry.user?.email?.[0]?.toUpperCase() || "F"}
                                          </span>
                                          <span>{entry.user?.name || entry.user?.email || entry.user || "-"}</span>
                                        </td>
                                        <td className="py-2 px-3 font-semibold text-green-700">₦{entry.amount?.toLocaleString()}</td>
                                        <td className="py-2 px-3 text-xs">
                                          <div className="font-semibold">{entry.bankDetails?.accountName}</div>
                                          <div className="text-slate-500">{entry.bankDetails?.accountNumber}</div>
                                          <div className="text-slate-500">{entry.bankDetails?.bankName}</div>
                                        </td>
                                        <td className="py-2 px-3">
                                          {entry.status === "pending" && <span className="inline-block rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">Pending</span>}
                                          {entry.status === "approved" && <span className="inline-block rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">Approved</span>}
                                          {entry.status === "paid" && <span className="inline-block rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold">Paid</span>}
                                          {entry.status === "refunded" && <span className="inline-block rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-semibold">Refunded</span>}
                                        </td>
                                        <td className="py-2 px-3">
                                          {entry.status === "pending" && (
                                            <div className="flex gap-2">
                                              <button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs font-semibold shadow transition" onClick={() => handleApprove(entry._id)}>Approve</button>
                                              <button className="rounded-md bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 text-xs font-semibold shadow transition" onClick={() => handleRefund(entry._id)}>Refund</button>
                                            </div>
                                          )}
                                          {entry.status === "approved" && (
                                            <button className="rounded-md bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs font-semibold shadow transition" onClick={() => handleMarkPaid(entry._id)}>Mark Paid</button>
                                          )}
                                          {entry.status === "paid" && <span className="text-green-700 font-semibold">Paid</span>}
                                          {entry.status === "refunded" && <span className="text-amber-700 font-semibold">Refunded</span>}
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>

                            </div>
                          ) : null)

// --- End Audit Log Section ---

                          {activeModule === "analytics" ? (
                            <section className="space-y-4">
                              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="m-0 text-lg font-semibold">Analytics Module</h3>
                                  <select
                                    value={analyticsCategory}
                                    onChange={(event) => setAnalyticsCategory(event.target.value)}
                                    className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-2 text-xs"
                                  >
                                    <option value="All">All categories</option>
                                    {FARMER_CATEGORIES.map((category) => (
                                      <option key={category} value={category}>{category}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={analyticsRegion}
                                    onChange={(event) => setAnalyticsRegion(event.target.value)}
                                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs"
                                  >
                                    {analyticsRegions.map((region) => (
                                      <option key={region} value={region}>{region}</option>
                                    ))}
                                  </select>
                                  <button onClick={exportAnalyticsCsv} className="rounded-md bg-cyan-600 px-3 py-2 text-xs font-semibold text-white">Download CSV</button>
                                  <button onClick={printInvestorReport} className="rounded-md bg-slate-700 px-3 py-2 text-xs font-semibold text-white">Download PDF</button>
                                </div>
                              </article>

                              <div className="grid gap-4 lg:grid-cols-2">
                                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                  <h3 className="m-0 text-sm font-semibold">Farmer Registrations by Category</h3>
                                  <div className="mt-3 h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={analyticsCategoryData}>
                                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                        <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <Tooltip contentStyle={chartTooltipStyle} />
                                        <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </article>

                                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                  <h3 className="m-0 text-sm font-semibold">Weekly Product Approvals</h3>
                                  <div className="mt-3 h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={weeklyApprovalsData}>
                                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <Tooltip contentStyle={chartTooltipStyle} />
                                        <Line type="monotone" dataKey="approvals" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </article>
                              </div>

                              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <h3 className="m-0 text-sm font-semibold">Order Volumes and Revenue Trends</h3>
                                <div className="mt-3 h-72">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analyticsTrendData}>
                                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                      <YAxis tick={{ fontSize: 12 }} />
                                      <Tooltip
                                        contentStyle={chartTooltipStyle}
                                        formatter={(value, name) => {
                                          if (name === "revenue") return [currencyFormatter.format(Number(value || 0)), "Revenue"];
                                          return [value, "Order Volume"];
                                        }}
                                      />
                                      <Legend />
                                      <Line type="monotone" dataKey="volume" name="Order Volume" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </article>
                            </section>
                          ) : null}

                          {activeModule === "settings" ? (
                            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <h3 className="m-0 text-lg font-semibold">Settings</h3>
                              <p className="mt-2 text-sm text-slate-600">Manage admin preferences, notifications, and module behavior.</p>
                              <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <label className="rounded-lg border border-slate-200 p-3 text-sm">
                                  <span className="font-semibold">Email Notifications</span>
                                  <p className="m-0 mt-1 text-xs text-slate-500">Receive approvals and order alerts by email.</p>
                                  <input type="checkbox" className="mt-2" defaultChecked />
                                </label>
                                <label className="rounded-lg border border-slate-200 p-3 text-sm">
                                  <span className="font-semibold">Auto-refresh Dashboard</span>
                                  <p className="m-0 mt-1 text-xs text-slate-500">Keep analytics and KPIs updated in real time.</p>
                                  <input type="checkbox" className="mt-2" defaultChecked />
                                </label>
                              </div>
                            </section>
                          ) : null}
                        </>
  );

  const deleteProduct = (id: string) => handleDelete("products", id);

  const approveProduct = async (id: string) => {
    try {
      setApprovingProductId(id);
      await API.patch(`/api/admin/products/${id}/approve`, null, { headers: getAuthHeaders() });
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, approved: true } : p)));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to approve product.");
    } finally {
      setApprovingProductId(null);
    }
  };

  const approveFarmer = async (id: string) => {
    try {
      if (id.startsWith("app:")) {
        const applicationId = id.replace("app:", "");
        const response = await API.patch(`/api/admin/farmer-applications/${applicationId}/approve`, null, {
          headers: getAuthHeaders(),
        });

        setFarmerApplications((prev) =>
          prev.map((application) =>
            application.applicationId === applicationId
              ? { ...application, status: "approved" }
              : application
          )
        );

        const approvedUser = response?.data?.user;
        if (approvedUser?._id) {
          setUsers((prev) =>
            prev.map((user) => (user._id === approvedUser._id ? { ...user, approved: true, role: "farmer" } : user))
          );
        }
      } else {
        await API.patch(`/api/admin/users/${id}/approve`, null, { headers: getAuthHeaders() });
        setUsers((prev) => prev.map((user) => (user._id === id ? { ...user, approved: true } : user)));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to approve farmer.");
    }
  };

  const getOrderItems = (order: AdminOrder) => {
    if (Array.isArray(order.products) && order.products.length > 0) return order.products;
    if (order.productId) return [{ productId: order.productId, quantity: order.quantity ?? 0 }];
    return [];
  };

  const getOrderTotal = (order: AdminOrder) => Number(order.totalAmount ?? order.totalPrice ?? 0);

  const getOrderSummary = (order: AdminOrder) => {
    const items = getOrderItems(order);
    if (items.length === 0) return "Unknown";
    if (items.length === 1) return items[0].productId?.name || "Unknown";
    return `${items.length} items`;
  };

  const getOrderQuantity = (order: AdminOrder) => {
    if (Array.isArray(order.products) && order.products.length > 0) {
      return order.products.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    }
    return Number(order.quantity || 0);
  };

  const getOrderBuyer = (order: AdminOrder) => order.buyerId?.name || order.buyerId?.email || "Unknown";

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!order.createdAt) return false;
      const created = new Date(order.createdAt);
      if (Number.isNaN(created.getTime())) return false;
      const now = new Date();
      const ageMs = now.getTime() - created.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      return ageDays <= rangeDays;
    });
  }, [orders, rangeDays]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const pendingFarmerApplicationCards: AdminUser[] = farmerApplications
    .filter((application) => application.status === "pending")
    .map((application) => ({
      _id: `app:${application.applicationId}`,
      name: application.account?.name || "Farmer Application",
      email: application.account?.email || application.applicationId,
      role: "farmer",
      approved: false,
      createdAt: application.createdAt,
    }));

  const searchableUsers = [...pendingFarmerApplicationCards, ...users].filter((u) => {
    if (!normalizedSearch) return true;
    return [u.name, u.email, u.role].join(" ").toLowerCase().includes(normalizedSearch);
  });

  const searchableProducts = products.filter((p) => {
    if (!normalizedSearch) return true;
    return [p.name, p.category, p.location, p.description].join(" ").toLowerCase().includes(normalizedSearch);
  });

  const searchableOrders = filteredOrders.filter((o) => {
    if (!normalizedSearch) return true;
    return [getOrderSummary(o), o.status, o.paymentStatus, o.buyerId?.email].join(" ").toLowerCase().includes(normalizedSearch);
  });

  const farmers = searchableUsers.filter((user) => user.role === "farmer");
  const pendingProducts = searchableProducts.filter((product) => !product.approved);

  const assignedFarmerCategories = useMemo(() => {
    const farmerIds = new Set(farmers.map((farmer) => farmer._id));
    const categoryCounterByFarmer: Record<string, Partial<Record<(typeof FARMER_CATEGORIES)[number], number>>> = {};

    products.forEach((product) => {
      const farmerId = typeof product.farmer === "string" ? product.farmer : product.farmer?._id;
      if (!farmerId || !farmerIds.has(farmerId)) return;

      const mapped = normalizeFarmerCategory(product.category);
      if (!mapped) return;

      if (!categoryCounterByFarmer[farmerId]) categoryCounterByFarmer[farmerId] = {};
      const count = categoryCounterByFarmer[farmerId][mapped] || 0;
      categoryCounterByFarmer[farmerId][mapped] = count + 1;
    });

    const categoryByFarmer: Record<string, (typeof FARMER_CATEGORIES)[number]> = {};
    Object.entries(categoryCounterByFarmer).forEach(([farmerId, counts]) => {
      const topCategory = Object.entries(counts).sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0]?.[0] as
        | (typeof FARMER_CATEGORIES)[number]
        | undefined;
      if (topCategory) categoryByFarmer[farmerId] = topCategory;
    });

    return categoryByFarmer;
  }, [farmers, products]);

  const farmerProfiles: FarmerProfile[] = farmers.map((farmer) => {
    const seed = hashText(farmer._id || farmer.email || farmer.name);
    const mappedCategory = normalizeFarmerCategory(farmer.category) || assignedFarmerCategories[farmer._id] || "Mixed";
    return {
      id: farmer._id,
      name: farmer.name,
      email: farmer.email,
      category: mappedCategory,
      approved: Boolean(farmer.approved),
      farmSize: `${2 + (seed % 20)} ha`,
      capacity: `${30 + (seed % 220)} tons/season`,
    };
  });

  const totalFarmers = farmerProfiles.length;
  const verifiedFarmers = farmerProfiles.filter((profile) => profile.approved).length;
  const pendingProductsCount = pendingProducts.length;
  const activeOrders = searchableOrders.length;
  const totalRevenue = searchableOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

  const farmerCategoryData = FARMER_CATEGORIES.map((category) => ({
    category,
    count: farmerProfiles.filter((profile) => profile.category === category).length,
  }));

  const orderStatusData = ORDER_STATUSES.map((status) => ({
    name: status,
    value: searchableOrders.filter((order) => normalizeOrderStatus(order.status) === status).length,
  }));

  const weeklyApprovalsData = (() => {
    const weekMap: Record<string, number> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
      const key = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      weekMap[key] = 0;
    }

    products.forEach((product) => {
      if (!product.approved || !product.createdAt) return;
      const date = new Date(product.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      if (Object.prototype.hasOwnProperty.call(weekMap, key)) weekMap[key] += 1;
    });

    return Object.entries(weekMap).map(([week, approvals]) => ({ week, approvals }));
  })();

  const trendDataBase = (() => {
    const bucket: Record<string, { label: string; volume: number; revenue: number }> = {};
    searchableOrders.forEach((order) => {
      const date = order.createdAt ? new Date(order.createdAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;
      const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!bucket[label]) bucket[label] = { label, volume: 0, revenue: 0 };
      bucket[label].volume += 1;
      bucket[label].revenue += getOrderTotal(order);
    });

    return Object.values(bucket).sort((a, b) => a.label.localeCompare(b.label)).slice(-6);
  })();

  const analyticsRegions = [
    "All",
    ...Array.from(new Set(products.map((product) => product.location).filter(Boolean) as string[])).sort(),
  ];

  const analyticsTrendData = trendDataBase.filter((entry) => {
    if (analyticsRegion === "All") return true;

    const hasRegionMatch = searchableOrders.some((order) => {
      if (!order.createdAt) return false;
      const date = new Date(order.createdAt);
      const entryLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return entryLabel === entry.label && order.productId?.location === analyticsRegion;
    });

    return hasRegionMatch;
  });

  const analyticsCategoryData =
    analyticsCategory === "All"
      ? farmerCategoryData
      : farmerCategoryData.filter((item) => item.category === analyticsCategory);

  const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });

  const compactFormatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  const exportAnalyticsCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Date Range (days)", String(rangeDays)],
      ["Total Farmers", String(totalFarmers)],
      ["Verified Farmers", String(verifiedFarmers)],
      ["Pending Products", String(pendingProductsCount)],
      ["Active Orders", String(activeOrders)],
      ["Total Revenue", String(totalRevenue)],
      [],
      ["Order ID", "Product", "Buyer", "Quantity", "Status", "Total", "Created At"],
      ...searchableOrders.map((order) => [
        order._id,
        getOrderSummary(order),
        getOrderBuyer(order),
        String(getOrderQuantity(order)),
        normalizeOrderStatus(order.status),
        String(getOrderTotal(order)),
        order.createdAt || "",
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `agrolink-admin-report-${rangeDays}d-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printInvestorReport = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  const getOrderStatusBadgeClass = (status: string) => {
    const normalized = normalizeOrderStatus(status);
    if (normalized === "Pending") return "border border-amber-300 bg-amber-100 text-amber-800";
    if (normalized === "Shipped") return "border border-blue-300 bg-blue-100 text-blue-700";
    if (normalized === "Delivered") return "border border-green-300 bg-green-100 text-green-700";
    return "border border-slate-300 bg-slate-200 text-slate-700";
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex flex-col md:flex-row min-h-screen w-full">
        {/* Sidebar: hidden on mobile, visible on md+ */}
        <aside className="hidden md:flex w-full md:w-64 shrink-0 flex-col bg-linear-to-b from-green-900 via-green-800 to-green-700 text-white">
          <div className="border-b border-white/15 px-5 py-5">
            <div className="flex items-center gap-2">
              <Image src="/dos-agrolink-logo.png" alt="DOS Agrolink Logo" width={36} height={36} className="rounded-lg bg-white/20" priority />
              <h1 className="m-0 text-xl font-semibold">Dos Agrolink</h1>
            </div>
          </div>
          <nav className="flex flex-col gap-1 px-2 py-4">
            {SIDE_NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveModule(item.key)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold ${activeModule === item.key ? "bg-green-900" : "bg-green-800/70"}`}
              >
                <span className="inline-flex items-center justify-center w-6 h-6">
                  {SIDE_NAV_ICON[item.key]}
                </span>
                <span className="text-base font-medium tracking-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 flex flex-col min-h-screen w-full">
          <header className="border-b border-green-800/30 bg-green-700 px-3 py-3 text-white md:px-6 w-full">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen((prev) => !prev)}
                  className="rounded-md border border-white/30 px-2 py-1 text-xs md:hidden"
                >
                  Menu
                </button>
                <h2 className="m-0 text-xl font-semibold">Welcome, Admin.</h2>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                <div className="flex flex-wrap gap-2 items-center w-full">
                  <div className="hidden md:block">
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search..."
                      className="w-56 rounded-lg bg-white/20 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                    />
                  </div>
                  <select
                    className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-xs text-white"
                    value={activeModule === 'farmers' ? (searchTerm ? '' : 'all') : 'all'}
                    onChange={e => {
                      if (activeModule === 'farmers') setSearchTerm(e.target.value === 'all' ? '' : e.target.value);
                    }}
                    style={{ minWidth: 120 }}
                  >
                    <option value="all">All Roles</option>
                    <option value="farmer">Farmers</option>
                    <option value="admin">Admins</option>
                    <option value="buyer">Buyers</option>
                  </select>
                  <select
                    className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-xs text-white"
                    value={activeModule === 'products' ? (searchTerm ? '' : 'all') : 'all'}
                    onChange={e => {
                      if (activeModule === 'products') setSearchTerm(e.target.value === 'all' ? '' : e.target.value);
                    }}
                    style={{ minWidth: 120 }}
                  >
                    <option value="all">All Categories</option>
                    {FARMER_CATEGORIES.map(cat => (
                      <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                    ))}
                  </select>
                  <select
                    className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-xs text-white"
                    value={activeModule === 'orders' ? (searchTerm ? '' : 'all') : 'all'}
                    onChange={e => {
                      if (activeModule === 'orders') setSearchTerm(e.target.value === 'all' ? '' : e.target.value);
                    }}
                    style={{ minWidth: 120 }}
                  >
                    <option value="all">All Statuses</option>
                    {ORDER_STATUSES.map(status => (
                      <option key={status} value={status.toLowerCase()}>{status}</option>
                    ))}
                  </select>
                  <span className="rounded-full bg-white/20 px-3 py-2 text-xs font-semibold">{notifications.length} Notifications</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileMenuOpen((prev) => !prev)}
                      className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold"
                    >
                      Admin
                    </button>
                    {profileMenuOpen && (
                      <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-slate-200 bg-white p-1 text-slate-700 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModule("settings");
                            setProfileMenuOpen(false);
                          }}
                          className="block w-full rounded-md px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100"
                        >
                          Profile Settings
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="block w-full rounded-md px-3 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {mobileNavOpen && (
              <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
                {SIDE_NAV_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveModule(item.key);
                      setMobileNavOpen(false);
                    }}
                    className={`rounded-md px-3 py-2 text-left text-xs font-semibold ${
                      activeModule === item.key ? "bg-green-900" : "bg-green-800/70"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
        </header>


        {/* Quick Actions and Insights Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <button
              className="rounded-md bg-green-700 text-white px-3 py-2 text-xs font-semibold hover:bg-green-800 transition"
              onClick={() => {
                if (pendingProducts.length === 0) return alert('No pending products to approve.');
                if (!confirm(`Approve all ${pendingProducts.length} pending products?`)) return;
                pendingProducts.forEach((product) => approveProduct(product._id));
              }}
              disabled={pendingProducts.length === 0}
            >
              Approve All Pending Products
            </button>
            <button
              className="rounded-md bg-cyan-700 text-white px-3 py-2 text-xs font-semibold hover:bg-cyan-800 transition"
              onClick={exportAnalyticsCsv}
            >
              Export Data (CSV)
            </button>
          </div>
          <div className="rounded-lg bg-white/60 px-4 py-2 text-xs text-slate-700 shadow border border-slate-200 max-w-md">
            <strong>Insight:</strong> {totalRevenue > 0
              ? `Revenue in the last ${rangeDays} days: ${currencyFormatter.format(totalRevenue)}.`
              : 'No revenue recorded in this period.'}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[30, 90, 365].map((value) => (
            <button
              key={value}
              onClick={() => setRangeDays(value as DateRange)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                rangeDays === value ? "border-green-700 bg-green-700 text-white" : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              Last {value} days
            </button>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto rounded-md border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700"
          >
            Logout
          </button>
        </div>

            {loading ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">Loading admin dashboard...</div> : null}
            {!loading && error ? <div className="rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-rose-700">{error}</div> : null}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 w-full">
                          {/* Advanced Analytics: Role Distribution & Approval Rate */}
                          {activeModule === "dashboard" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
                              {/* Role Distribution Pie Chart */}
                              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <h3 className="m-0 text-base font-semibold mb-2">User Role Distribution</h3>
                                <div className="h-64">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={[
                                          { name: "Farmers", value: users.filter((u) => u.role === "farmer").length },
                                          { name: "Admins", value: users.filter((u) => u.role === "admin").length },
                                          { name: "Buyers", value: users.filter((u) => u.role === "buyer").length },
                                        ]}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={80}
                                        fill="#16a34a"
                                        label
                                      >
                                        {[
                                          { name: "Farmers", value: users.filter((u) => u.role === "farmer").length },
                                          { name: "Admins", value: users.filter((u) => u.role === "admin").length },
                                          { name: "Buyers", value: users.filter((u) => u.role === "buyer").length },
                                        ].map((entry, idx) => (
                                          <Cell key={entry.name} fill={["#16a34a", "#0ea5e9", "#f59e0b"][idx]} />
                                        ))}
                                      </Pie>
                                      <Tooltip contentStyle={chartTooltipStyle} />
                                      <Legend />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                              </article>
                              {/* Farmer Approval Rate Bar Chart */}
                              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <h3 className="m-0 text-base font-semibold mb-2">Farmer Approval Rate</h3>
                                <div className="h-64">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                      { name: "Approved", value: verifiedFarmers },
                                      { name: "Pending", value: totalFarmers - verifiedFarmers },
                                    ]}>
                                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                      <Tooltip contentStyle={chartTooltipStyle} />
                                      <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </article>
                            </div>
                          )}
                        {/* End dashboard module block */}
                        {/* The following articles should be inside the dashboard block or moved to the correct module block as needed. If they are dashboard stats, keep them inside the dashboard conditional. */}

            {activeModule === "notifications" ? (
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-bold mb-4">Notifications Center</h3>
                <ul className="space-y-2">
                  {notifications.length === 0 && <li className="text-slate-500">No notifications.</li>}
                  {notifications.map((notif) => (
                    <li key={notif.id} className="rounded-lg bg-white shadow px-4 py-3 flex items-center gap-3 border-l-4 border-green-600/60">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-600/60"></span>
                      <span className="flex-1">
                        <span className="font-semibold">{NOTIF_TYPES[notif.type] || notif.type}:</span> {notif.message}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {activeModule === "auditlog" ? (
              <div className="max-w-3xl mx-auto">
                <h3 className="text-lg font-bold mb-4">Audit Log</h3>
                <table className="w-full bg-white rounded-lg shadow">
                  <thead>
                    <tr className="bg-green-50 text-green-900">
                      <th className="py-2 px-3 text-left">Action</th>
                      <th className="py-2 px-3 text-left">User</th>
                      <th className="py-2 px-3 text-left">Target</th>
                      <th className="py-2 px-3 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                      {auditLog.length === 0 ? (
                        <tr><td colSpan={4} className="text-slate-500 py-4 text-center">No audit log entries.</td></tr>
                      )}

                      {auditLog.map((entry) => (
                        <tr key={entry.id} className="border-b last:border-b-0">
                          <td className="py-2 px-3">{entry.action}</td>
                          <td className="py-2 px-3">{entry.user}</td>
                          <td className="py-2 px-3">{entry.target}</td>
                          <td className="py-2 px-3 text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>


            {activeModule === "farmers" ? (
              <section className="space-y-4">
                {FARMER_CATEGORIES.map((category) => {
                  const categoryFarmers = farmerProfiles.filter((profile) => profile.category === category);
                  if (categoryFarmers.length === 0) return null;

                  return (
                    <article key={category} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="m-0 text-lg font-semibold">{category} Farmers</h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {categoryFarmers.map((farmer) => (
                          <div key={farmer.id} className="rounded-xl border border-slate-200 p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="m-0 text-base font-semibold">{farmer.name}</h4>
                              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${farmer.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                {farmer.approved ? "Verified" : "Pending"}
                              </span>
                            </div>
                            <p className="m-0 mt-1 text-xs text-slate-500">{farmer.email}</p>
                            <p className="m-0 mt-3 text-sm"><strong>Farm Size:</strong> {farmer.farmSize}</p>
                            <p className="m-0 mt-1 text-sm"><strong>Capacity:</strong> {farmer.capacity}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => approveFarmer(farmer.id)}
                                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => approveFarmer(farmer.id)}
                                className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Verify
                              </button>
                              <button
                                type="button"
                                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                              >
                                View Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : null}

            {activeModule === "products" ? (
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="m-0 text-lg font-semibold">Pending Products Queue</h3>
                <p className="mt-1 text-xs text-slate-500">Approved products are immediately available to marketplace consumers.</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {pendingProducts.map((product) => (
                    <article key={product._id} className="rounded-xl border border-slate-200 p-3">
                      {product.image || product.imageUrl ? (
                        <div className="relative h-36 w-full overflow-hidden rounded-lg">
                          <Image
                            src={product.image || product.imageUrl || ""}
                            alt={product.name}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-36 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">No image</div>
                      )}
                      <h4 className="m-0 mt-3 text-base font-semibold">{product.name}</h4>
                      <p className="m-0 mt-1 text-sm text-slate-500">{product.description || "No description"}</p>
                      <p className="m-0 mt-2 text-lg font-bold text-green-700">{currencyFormatter.format(product.price || 0)}</p>

                      <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          {[30, 90, 365].map((value) => (
                            <button
                              key={value}
                              onClick={() => setRangeDays(value as DateRange)}
                              className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                                rangeDays === value ? "border-green-700 bg-green-700 text-white" : "border-slate-300 bg-white text-slate-700"
                              }`}
                            >
                              Last {value} days
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="ml-auto rounded-md border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700"
                          >
                            Logout
                          </button>
                        </div>

                        {loading ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">Loading admin dashboard...</div> : null}
                        {!loading && error ? <div className="rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-rose-700">{error}</div> : null}

                        {activeModule === "dashboard" && (
                          <>
                            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="m-0 text-sm font-semibold text-slate-500">Total Farmers</p>
                                    <p className="m-0 mt-2 text-3xl font-bold text-slate-800">{compactFormatter.format(totalFarmers)}</p>
                                  </div>
                                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">FM</span>
                                </div>
                              </article>
                              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="m-0 text-sm font-semibold text-slate-500">Verified Farmers</p>
                                    <p className="m-0 mt-2 text-3xl font-bold text-green-700">{compactFormatter.format(verifiedFarmers)}</p>
                                  </div>
                                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">OK</span>
                                </div>
                              </article>
                              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="m-0 text-sm font-semibold text-slate-500">Pending Products</p>
                                    <p className="m-0 mt-2 text-3xl font-bold text-amber-600">{compactFormatter.format(pendingProductsCount)}</p>
                                  </div>
                                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">PD</span>
                                </div>
                              </article>
                              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="m-0 text-sm font-semibold text-slate-500">Active Orders</p>
                                    <p className="m-0 mt-2 text-3xl font-bold text-blue-600">{compactFormatter.format(activeOrders)}</p>
                                  </div>
                                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">OR</span>
                                </div>
                              </article>
                            </section>
                            {/* ...existing dashboard analytics and tables... */}
                          </>
                        )}

                        {activeModule === "notifications" && (
                          <div className="max-w-2xl mx-auto">
                            <h3 className="text-lg font-bold mb-4">Notifications Center</h3>
                            <ul className="space-y-2">
                              {notifications.length === 0 && <li className="text-slate-500">No notifications.</li>}
                              {notifications.map((notif) => (
                                <li key={notif.id} className="rounded-lg bg-white shadow px-4 py-3 flex items-center gap-3 border-l-4 border-green-600/60">
                                  <span className="inline-block w-2 h-2 rounded-full bg-green-600/60"></span>
                                  <span className="flex-1">
                                    <span className="font-semibold">{NOTIF_TYPES[notif.type] || notif.type}:</span> {notif.message}
                                  </span>
                                  <span className="text-xs text-slate-400">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {activeModule === "auditlog" ? (
                          <div className="max-w-3xl mx-auto">
                            <h3 className="text-lg font-bold mb-4">Audit Log</h3>
                            <table className="w-full bg-white rounded-lg shadow">
                              <thead>
                                <tr className="bg-green-50 text-green-900">
                                  <th className="py-2 px-3 text-left">Action</th>
                                  <th className="py-2 px-3 text-left">User</th>
                                  <th className="py-2 px-3 text-left">Target</th>
                                  <th className="py-2 px-3 text-left">Timestamp</th>
                                </tr>
                              </thead>
                              <tbody>
                                {auditLog.length === 0 ? (
                                  <tr><td colSpan={4} className="text-slate-500 py-4 text-center">No audit log entries.</td></tr>
                                ) : (
                                  auditLog.map((entry) => (
                                    <tr key={entry.id} className="border-b last:border-b-0">
                                      <td className="py-2 px-3">{entry.action}</td>
                                      <td className="py-2 px-3">{entry.user}</td>
                                      <td className="py-2 px-3">{entry.target}</td>
                                      <td className="py-2 px-3 text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        ) : null}

                        {/* ...other module blocks (farmers, products, orders, analytics, settings)... */}
                      </div>
                    </article>
                  )}
                </section>
              </section>
            ) : null;

            <>
            {activeModule === "analytics" ? (
                          ) : null}
                          </>
              <section className="space-y-4">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="m-0 text-lg font-semibold">Analytics Module</h3>
                    <select
                      value={analyticsCategory}
                      onChange={(event) => setAnalyticsCategory(event.target.value)}
                      className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-2 text-xs"
                    >
                      <option value="All">All categories</option>
                      {FARMER_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <select
                      value={analyticsRegion}
                      onChange={(event) => setAnalyticsRegion(event.target.value)}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs"
                    >
                      {analyticsRegions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    <button onClick={exportAnalyticsCsv} className="rounded-md bg-cyan-600 px-3 py-2 text-xs font-semibold text-white">Download CSV</button>
                    <button onClick={printInvestorReport} className="rounded-md bg-slate-700 px-3 py-2 text-xs font-semibold text-white">Download PDF</button>
                  </div>
                </article>

                <div className="grid gap-4 lg:grid-cols-2">
                  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="m-0 text-sm font-semibold">Farmer Registrations by Category</h3>
                    <div className="mt-3 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsCategoryData}>
                          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </article>

                  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="m-0 text-sm font-semibold">Weekly Product Approvals</h3>
                    <div className="mt-3 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyApprovalsData}>
                          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Line type="monotone" dataKey="approvals" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </article>
                </div>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="m-0 text-sm font-semibold">Order Volumes and Revenue Trends</h3>
                  <div className="mt-3 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsTrendData}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={chartTooltipStyle}
                          formatter={(value, name) => {
                            if (name === "revenue") return [currencyFormatter.format(Number(value || 0)), "Revenue"];
                            return [value, "Order Volume"];
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="volume" name="Order Volume" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>
              </section>
            ) : null}

            {activeModule === "settings" ? (
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="m-0 text-lg font-semibold">Settings</h3>
                <p className="mt-2 text-sm text-slate-600">Manage admin preferences, notifications, and module behavior.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="rounded-lg border border-slate-200 p-3 text-sm">
                    <span className="font-semibold">Email Notifications</span>
                    <p className="m-0 mt-1 text-xs text-slate-500">Receive approvals and order alerts by email.</p>
                    <input type="checkbox" className="mt-2" defaultChecked />
                  </label>
                  <label className="rounded-lg border border-slate-200 p-3 text-sm">
                    <span className="font-semibold">Auto-refresh Dashboard</span>
                    <p className="m-0 mt-1 text-xs text-slate-500">Keep analytics and KPIs updated in real time.</p>
                    <input type="checkbox" className="mt-2" defaultChecked />
                  </label>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
