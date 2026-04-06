"use client";

import { useEffect, useMemo, useState } from "react";

type InputUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved?: boolean;
};

type InputOrder = {
  _id: string;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
  totalPrice: number;
  totalAmount?: number;
  buyerId?: {
    name?: string;
    email?: string;
  };
};

type UnifiedUser = {
  id: string;
  name: string;
  email: string;
  type: "Farmer" | "Buyer" | "Admin";
  locationState: string;
  locationLga: string;
  trustScore: number;
  accountStatus: "Active" | "Suspended" | "Pending KYC";
  joinDate: string;
};

type Props = {
  users: InputUser[];
  orders: InputOrder[];
  currencyFormatter: Intl.NumberFormat;
};

type Zone =
  | "core"
  | "finance"
  | "risk"
  | "marketplace"
  | "operations"
  | "customer"
  | "insight"
  | "admin";

type AuditRecord = {
  id: string;
  action: string;
  actor: string;
  target: string;
  when: string;
};

type PendingAction = {
  title: string;
  description: string;
  execute: () => void;
};

const STATES = ["Lagos", "Kano", "Kaduna", "Ogun", "Rivers", "Oyo", "FCT", "Delta"] as const;
const LGAS = ["North", "Central", "South", "Municipal", "East", "West"] as const;
const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
const ZONES: Array<{ id: Zone; label: string; keyHint: string }> = [
  { id: "core", label: "User Management", keyHint: "U" },
  { id: "finance", label: "Transactions & Payment", keyHint: "D" },
  { id: "risk", label: "Loan & Credit", keyHint: "L" },
  { id: "marketplace", label: "Supply & Demand", keyHint: "M" },
  { id: "operations", label: "Logistics", keyHint: "O" },
  { id: "customer", label: "Support & Comms", keyHint: "C" },
  { id: "insight", label: "Analytics", keyHint: "A" },
  { id: "admin", label: "Roles & Audit", keyHint: "R" },
];

const hashText = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const formatDate = (raw: string): string => {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export default function AdminUnifiedCommandCenter({ users, orders, currencyFormatter }: Props) {
  const [zone, setZone] = useState<Zone>("core");
  const [darkMode, setDarkMode] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [userTypeFilter, setUserTypeFilter] = useState<"All" | "Farmer" | "Buyer" | "Admin">("All");
  const [stateFilter, setStateFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Suspended" | "Pending KYC">("All");
  const [scoreMin, setScoreMin] = useState(0);
  const [scoreMax, setScoreMax] = useState(100);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastSegment, setBroadcastSegment] = useState("All users");
  const [agentAssign, setAgentAssign] = useState("Agent A");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [auditLog, setAuditLog] = useState<AuditRecord[]>([]);

  const surfaceClass = darkMode
    ? "border-slate-700/90 bg-slate-900/70 text-slate-100"
    : "border-slate-200 bg-white text-slate-900";
  const mutedClass = darkMode ? "text-slate-400" : "text-slate-600";

  const unifiedUsers = useMemo<UnifiedUser[]>(() => {
    return users.map((user, index) => {
      const seed = hashText(user._id || user.email || String(index));
      const state = STATES[seed % STATES.length];
      const lga = `${state} ${LGAS[seed % LGAS.length]}`;
      const trust = 55 + (seed % 41);
      const createdAt = new Date(Date.now() - (seed % 360) * 24 * 60 * 60 * 1000).toISOString();
      const status: UnifiedUser["accountStatus"] = !user.approved
        ? "Pending KYC"
        : seed % 17 === 0
        ? "Suspended"
        : "Active";

      return {
        id: user._id,
        name: user.name || user.email.split("@")[0] || "Unknown",
        email: user.email,
        type: user.role === "farmer" ? "Farmer" : user.role === "buyer" ? "Buyer" : "Admin",
        locationState: state,
        locationLga: lga,
        trustScore: trust,
        accountStatus: status,
        joinDate: createdAt,
      };
    });
  }, [users]);

  const selectedUser = useMemo(
    () => unifiedUsers.find((user) => user.id === selectedUserId) || null,
    [unifiedUsers, selectedUserId]
  );

  const filteredUsers = useMemo(() => {
    return unifiedUsers.filter((user) => {
      if (userTypeFilter !== "All" && user.type !== userTypeFilter) return false;
      if (stateFilter !== "All" && user.locationState !== stateFilter) return false;
      if (statusFilter !== "All" && user.accountStatus !== statusFilter) return false;
      if (user.trustScore < scoreMin || user.trustScore > scoreMax) return false;
      return true;
    });
  }, [unifiedUsers, userTypeFilter, stateFilter, statusFilter, scoreMin, scoreMax]);

  const transactions = useMemo(() => {
    return orders.map((order, index) => {
      const seed = hashText(order._id || String(index));
      const typePool = ["Farmer payout", "Loan disbursement", "Repayment", "Wallet funding"];
      const statusPool = ["Pending", "Completed", "Failed", "Disputed"] as const;
      const paymentStatus = (order.paymentStatus || "pending").toLowerCase();
      const mappedStatus =
        paymentStatus === "paid"
          ? "Completed"
          : paymentStatus === "failed"
          ? "Failed"
          : order.status.toLowerCase().includes("dispute")
          ? "Disputed"
          : statusPool[seed % statusPool.length];

      return {
        id: order._id,
        type: typePool[seed % typePool.length],
        amount: Number(order.totalAmount ?? order.totalPrice ?? 0),
        status: mappedStatus,
        crop: ["Cassava", "Maize", "Rice", "Tomato", "Yam"][seed % 5],
        region: STATES[seed % STATES.length],
        createdAt: order.createdAt || new Date().toISOString(),
      };
    });
  }, [orders]);

  const disputes = useMemo(() => {
    return transactions
      .filter((txn) => txn.status === "Disputed" || txn.status === "Failed")
      .slice(0, 8)
      .map((txn, index) => ({
        id: `DSP-${txn.id.slice(-6).toUpperCase()}`,
        transactionId: txn.id,
        reason: index % 2 === 0 ? "Quality rejection" : "Quantity mismatch",
        priority: PRIORITIES[index % PRIORITIES.length],
        farmer: `Farmer ${index + 1}`,
        buyer: `Buyer ${index + 1}`,
        evidenceCount: 2 + (index % 3),
      }));
  }, [transactions]);

  const loans = useMemo(() => {
    const farmers = unifiedUsers.filter((u) => u.type === "Farmer").slice(0, 10);
    const buyers = unifiedUsers.filter((u) => u.type === "Buyer").slice(0, 10);

    return {
      farmerLoans: farmers.map((user, i) => ({
        id: `FL-${user.id.slice(-4)}`,
        name: user.name,
        amount: 300000 + i * 45000,
        interest: 12,
        dueDate: new Date(Date.now() + (i - 3) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        repaymentPercent: Math.max(0, 80 - i * 7),
      })),
      buyerCreditLines: buyers.map((user, i) => ({
        id: `BC-${user.id.slice(-4)}`,
        name: user.name,
        used: 120000 + i * 20000,
        available: 500000 - i * 15000,
        overdueDays: i > 6 ? (i - 6) * 5 : 0,
      })),
    };
  }, [unifiedUsers]);

  const kpis = useMemo(() => {
    const activeFarmers = unifiedUsers.filter((u) => u.type === "Farmer" && u.accountStatus === "Active").length;
    const activeBuyers = unifiedUsers.filter((u) => u.type === "Buyer" && u.accountStatus === "Active").length;
    const weeklyVolume = transactions.slice(0, 20).reduce((sum, tx) => sum + tx.amount, 0);
    const avgFulfillmentHours = 18.4;
    const disputeRate = transactions.length ? (disputes.length / transactions.length) * 100 : 0;

    return {
      activeFarmers,
      activeBuyers,
      weeklyVolume,
      avgFulfillmentHours,
      disputeRate,
    };
  }, [unifiedUsers, transactions, disputes.length]);

  const commissionByCrop = useMemo(() => {
    const cropMap: Record<string, number> = {};
    transactions.forEach((txn) => {
      cropMap[txn.crop] = (cropMap[txn.crop] || 0) + txn.amount * 0.02;
    });
    return Object.entries(cropMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [transactions]);

  const addAudit = (action: string, target: string) => {
    setAuditLog((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        action,
        actor: "Current Admin",
        target,
        when: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const requireConfirm = (title: string, description: string, execute: () => void) => {
    setPendingAction({ title, description, execute });
  };

  const handleBulkSuspend = () => {
    const targets = unifiedUsers.filter((user) => selectedUserIds.has(user.id));
    requireConfirm(
      "Confirm suspend action",
      `Suspend ${targets.length} selected account(s)? This action will be logged in audit trail.`,
      () => {
        targets.forEach((user) => addAudit("Suspend account", `${user.name} (${user.type})`));
        setSelectedUserIds(new Set());
        setPendingAction(null);
      }
    );
  };

  const handleBulkActivate = () => {
    const targets = unifiedUsers.filter((user) => selectedUserIds.has(user.id));
    requireConfirm(
      "Confirm activate action",
      `Activate ${targets.length} selected account(s)? This action will be logged in audit trail.`,
      () => {
        targets.forEach((user) => addAudit("Activate account", `${user.name} (${user.type})`));
        setSelectedUserIds(new Set());
        setPendingAction(null);
      }
    );
  };

  const handleBroadcast = () => {
    if (!broadcastText.trim()) return;
    requireConfirm(
      "Confirm broadcast",
      `Send message to ${broadcastSegment}? Delivery channels: SMS, push, and in-app.`,
      () => {
        addAudit("Broadcast message", broadcastSegment);
        setBroadcastText("");
        setPendingAction(null);
      }
    );
  };

  const holdSettlement = (disputeId: string) => {
    requireConfirm(
      "Confirm settlement hold",
      `Hold settlement for dispute ${disputeId}? This may delay payout until review is completed.`,
      () => {
        addAudit("Hold settlement", disputeId);
        setPendingAction(null);
      }
    );
  };

  const releaseSettlement = (disputeId: string) => {
    requireConfirm(
      "Confirm settlement release",
      `Release settlement for dispute ${disputeId} to selected party?`,
      () => {
        addAudit("Release settlement", disputeId);
        setPendingAction(null);
      }
    );
  };

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const key = event.key.toLowerCase();
      if (key === "u") setZone("core");
      if (key === "d") setZone("finance");
      if (key === "l") setZone("risk");
      if (key === "m") setZone("marketplace");
      if (key === "o") setZone("operations");
      if (key === "c") setZone("customer");
      if (key === "a") setZone("insight");
      if (key === "r") setZone("admin");
    };

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  const userSelectionCount = selectedUserIds.size;

  return (
    <section className={`mt-4 rounded-2xl border p-4 ${surfaceClass}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={`m-0 text-xs uppercase tracking-[0.11em] ${mutedClass}`}>Integrated Admin Zone</p>
          <h2 className="m-0 mt-1 text-xl font-semibold">Dos Agrolink Admin Command Center</h2>
          <p className={`m-0 mt-1 text-sm ${mutedClass}`}>Unified management for farmers and buyers with safe controls and audit visibility.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${darkMode ? "border-emerald-500/40 bg-emerald-900/30 text-emerald-200" : "border-emerald-300 bg-emerald-50 text-emerald-700"}`}>
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            WebSocket: Connected
          </span>
          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${darkMode ? "border-slate-600 bg-slate-800 text-slate-100" : "border-slate-300 bg-slate-100 text-slate-700"}`}
          >
            {darkMode ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/70" : "border-slate-200 bg-slate-50"}`}>
          <p className={`m-0 text-xs ${mutedClass}`}>Active Farmers</p>
          <p className="m-0 mt-1 text-xl font-semibold">{kpis.activeFarmers}</p>
        </div>
        <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/70" : "border-slate-200 bg-slate-50"}`}>
          <p className={`m-0 text-xs ${mutedClass}`}>Active Buyers</p>
          <p className="m-0 mt-1 text-xl font-semibold">{kpis.activeBuyers}</p>
        </div>
        <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/70" : "border-slate-200 bg-slate-50"}`}>
          <p className={`m-0 text-xs ${mutedClass}`}>Weekly Transaction Volume</p>
          <p className="m-0 mt-1 text-xl font-semibold">{currencyFormatter.format(kpis.weeklyVolume)}</p>
        </div>
        <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/70" : "border-slate-200 bg-slate-50"}`}>
          <p className={`m-0 text-xs ${mutedClass}`}>Avg Fulfillment Time</p>
          <p className="m-0 mt-1 text-xl font-semibold">{kpis.avgFulfillmentHours.toFixed(1)} hrs</p>
        </div>
        <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/70" : "border-slate-200 bg-slate-50"}`}>
          <p className={`m-0 text-xs ${mutedClass}`}>Dispute Rate</p>
          <p className="m-0 mt-1 text-xl font-semibold">{kpis.disputeRate.toFixed(2)}%</p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {ZONES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setZone(item.id)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              zone === item.id
                ? darkMode
                  ? "border-blue-400 bg-blue-900/40 text-blue-100"
                  : "border-blue-400 bg-blue-50 text-blue-700"
                : darkMode
                ? "border-slate-700 bg-slate-800 text-slate-200"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            {item.label} ({item.keyHint})
          </button>
        ))}
      </div>

      {zone === "core" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <div className="mb-3 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
              <select value={userTypeFilter} onChange={(e) => setUserTypeFilter(e.target.value as typeof userTypeFilter)} className={`rounded-lg border px-2 py-2 text-xs ${darkMode ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"}`}>
                <option value="All">All types</option>
                <option value="Farmer">Farmer</option>
                <option value="Buyer">Buyer</option>
                <option value="Admin">Admin</option>
              </select>
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className={`rounded-lg border px-2 py-2 text-xs ${darkMode ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"}`}>
                <option value="All">All states</option>
                {STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className={`rounded-lg border px-2 py-2 text-xs ${darkMode ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"}`}>
                <option value="All">All status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending KYC">Pending KYC</option>
              </select>
              <div className="grid grid-cols-2 gap-1">
                <input type="number" min={0} max={100} value={scoreMin} onChange={(e) => setScoreMin(Number(e.target.value || 0))} className={`rounded-lg border px-2 py-2 text-xs ${darkMode ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"}`} placeholder="Score min" />
                <input type="number" min={0} max={100} value={scoreMax} onChange={(e) => setScoreMax(Number(e.target.value || 100))} className={`rounded-lg border px-2 py-2 text-xs ${darkMode ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"}`} placeholder="Score max" />
              </div>
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <button type="button" disabled={!userSelectionCount} onClick={handleBulkSuspend} className="rounded-lg border border-red-400/70 bg-red-900/30 px-3 py-2 text-xs font-semibold text-red-100 disabled:cursor-not-allowed disabled:opacity-60">Suspend Selected</button>
              <button type="button" disabled={!userSelectionCount} onClick={handleBulkActivate} className="rounded-lg border border-emerald-400/70 bg-emerald-900/30 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60">Activate Selected</button>
              <select value={agentAssign} onChange={(e) => setAgentAssign(e.target.value)} className={`rounded-lg border px-2 py-2 text-xs ${darkMode ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"}`}>
                <option>Agent A</option>
                <option>Agent B</option>
                <option>Agent C</option>
              </select>
              <button
                type="button"
                disabled={!userSelectionCount}
                onClick={() => {
                  addAudit("Assign to agent", `${userSelectionCount} users to ${agentAssign}`);
                  setSelectedUserIds(new Set());
                }}
                className="rounded-lg border border-blue-400/70 bg-blue-900/30 px-3 py-2 text-xs font-semibold text-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Assign
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className={darkMode ? "text-slate-300" : "text-slate-600"}>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Select</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Name</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Type</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Location</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Trust Score</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Account Status</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Join Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`cursor-pointer border-b ${darkMode ? "border-slate-800 hover:bg-slate-800/80" : "border-slate-200 hover:bg-slate-100"}`} onClick={() => setSelectedUserId(user.id)}>
                      <td className="px-2 py-2" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.has(user.id)}
                          onChange={(event) => {
                            setSelectedUserIds((prev) => {
                              const next = new Set(prev);
                              if (event.target.checked) next.add(user.id);
                              else next.delete(user.id);
                              return next;
                            });
                          }}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="font-semibold">{user.name}</div>
                        <div className={`text-xs ${mutedClass}`}>{user.email}</div>
                      </td>
                      <td className="px-2 py-2">{user.type}</td>
                      <td className="px-2 py-2">{user.locationLga}</td>
                      <td className="px-2 py-2">{user.trustScore}</td>
                      <td className="px-2 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.accountStatus === "Active" ? "bg-emerald-700/30 text-emerald-200" : user.accountStatus === "Suspended" ? "bg-red-700/30 text-red-200" : "bg-yellow-700/30 text-yellow-200"}`}>
                          {user.accountStatus}
                        </span>
                      </td>
                      <td className="px-2 py-2">{formatDate(user.joinDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">User Detail Drawer</h3>
            {!selectedUser ? <p className={`mt-2 text-sm ${mutedClass}`}>Select a user to view full profile, transactions, support tickets, and linked entities.</p> : null}
            {selectedUser ? (
              <div className="mt-2 grid gap-2 text-sm">
                <div className="rounded-lg border border-slate-700/70 p-2">
                  <div className="font-semibold">{selectedUser.name}</div>
                  <div className={mutedClass}>{selectedUser.email}</div>
                  <div className={`mt-1 text-xs ${mutedClass}`}>{selectedUser.type} | {selectedUser.locationLga}</div>
                </div>
                <div className="rounded-lg border border-slate-700/70 p-2">
                  <p className="m-0 font-semibold">Transaction Summary</p>
                  <p className={`m-0 mt-1 text-xs ${mutedClass}`}>12 transactions | 2 pending settlements | 1 dispute</p>
                </div>
                <div className="rounded-lg border border-slate-700/70 p-2">
                  <p className="m-0 font-semibold">Loan/Credit Summary</p>
                  <p className={`m-0 mt-1 text-xs ${mutedClass}`}>Outstanding: {currencyFormatter.format(245000)} | Risk band: Moderate</p>
                </div>
                <div className="rounded-lg border border-slate-700/70 p-2">
                  <p className="m-0 font-semibold">Support Tickets</p>
                  <p className={`m-0 mt-1 text-xs ${mutedClass}`}>Open tickets: 2 | Assigned agent: {agentAssign}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="flex-1 rounded-lg border border-blue-400/70 bg-blue-900/30 px-3 py-2 text-xs font-semibold text-blue-100">See as {selectedUser.type === "Farmer" ? "Farmer" : "Buyer"}</button>
                  <button type="button" className="flex-1 rounded-lg border border-slate-500/70 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-100">Linked Entities</button>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}

      {zone === "finance" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">Real-time Transaction Feed</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className={mutedClass}>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">ID</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Type</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Amount</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Status</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Region</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((txn) => (
                    <tr key={txn.id} className="border-b border-slate-800">
                      <td className="px-2 py-2 text-xs">{txn.id.slice(-8)}</td>
                      <td className="px-2 py-2">{txn.type}</td>
                      <td className="px-2 py-2">{currencyFormatter.format(txn.amount)}</td>
                      <td className="px-2 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs ${txn.status === "Completed" ? "bg-emerald-700/30 text-emerald-200" : txn.status === "Pending" ? "bg-yellow-700/30 text-yellow-200" : "bg-red-700/30 text-red-200"}`}>{txn.status}</span>
                      </td>
                      <td className="px-2 py-2">{txn.region}</td>
                      <td className="px-2 py-2">{formatDate(txn.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">Dispute Management Queue</h3>
            <div className="mt-2 grid gap-2">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="rounded-lg border border-slate-700/70 p-2 text-sm">
                  <p className="m-0 font-semibold">{dispute.id}</p>
                  <p className={`m-0 mt-1 text-xs ${mutedClass}`}>{dispute.reason} | {dispute.farmer} vs {dispute.buyer}</p>
                  <p className={`m-0 mt-1 text-xs ${mutedClass}`}>Evidence: {dispute.evidenceCount} photo(s) | Priority: {dispute.priority}</p>
                  <div className="mt-2 flex gap-1">
                    <button type="button" onClick={() => holdSettlement(dispute.id)} className="rounded-md border border-yellow-400/70 bg-yellow-900/30 px-2 py-1 text-xs text-yellow-100">Hold</button>
                    <button type="button" onClick={() => releaseSettlement(dispute.id)} className="rounded-md border border-emerald-400/70 bg-emerald-900/30 px-2 py-1 text-xs text-emerald-100">Release</button>
                    <button type="button" className="rounded-md border border-blue-400/70 bg-blue-900/30 px-2 py-1 text-xs text-blue-100">Chat Log</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-cyan-400/30 bg-cyan-900/20 p-2 text-xs text-cyan-100">
              Commission snapshot: {currencyFormatter.format(commissionByCrop.reduce((sum, [, value]) => sum + value, 0))} (today/week/month breakdown available)
            </div>
          </aside>
        </div>
      ) : null}

      {zone === "risk" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">Active Loan Portfolio</h3>
            <div className="mt-2 grid gap-2 text-sm">
              {loans.farmerLoans.slice(0, 6).map((loan) => (
                <div key={loan.id} className="rounded-lg border border-slate-700/70 p-2">
                  <p className="m-0 font-semibold">{loan.name}</p>
                  <p className={`m-0 mt-1 text-xs ${mutedClass}`}>Loan: {currencyFormatter.format(loan.amount)} | Interest: {loan.interest}% | Due: {formatDate(loan.dueDate)}</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-700">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${loan.repaymentPercent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">Buyer Credit Lines & Default Rules</h3>
            <div className="mt-2 grid gap-2 text-sm">
              {loans.buyerCreditLines.slice(0, 6).map((line) => (
                <div key={line.id} className="rounded-lg border border-slate-700/70 p-2">
                  <p className="m-0 font-semibold">{line.name}</p>
                  <p className={`m-0 mt-1 text-xs ${mutedClass}`}>Used: {currencyFormatter.format(line.used)} | Available: {currencyFormatter.format(line.available)}</p>
                  <p className={`m-0 mt-1 text-xs ${line.overdueDays > 0 ? "text-red-300" : mutedClass}`}>Overdue: {line.overdueDays} day(s)</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-red-400/30 bg-red-900/20 p-2 text-xs text-red-100">
              Auto-default rule: Flag accounts after 30 overdue days.
              <button type="button" onClick={() => addAudit("Manual default override", "Risk policy override")}
                className="ml-2 rounded-md border border-red-400/60 px-2 py-1">Manual Override</button>
            </div>
            <div className="mt-2 rounded-lg border border-blue-400/30 bg-blue-900/20 p-2 text-xs text-blue-100">
              Credit scoring simulator: farmer trust score 78 with recommended credit increase +12%.
            </div>
          </div>
        </div>
      ) : null}

      {zone === "marketplace" ? (
        <div className="grid gap-3 md:grid-cols-3">
          <article className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-sm font-semibold">Unmatched Supply</h3>
            <p className={`m-0 mt-2 text-sm ${mutedClass}`}>12 tons of cassava listed for over 72 hours without buyer response.</p>
            <button type="button" onClick={() => addAudit("Push nearby buyer alert", "Cassava unmatched supply")}
              className="mt-2 rounded-lg border border-blue-400/70 bg-blue-900/30 px-3 py-2 text-xs text-blue-100">Notify Nearby Buyers</button>
          </article>
          <article className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-sm font-semibold">Unmatched Demand</h3>
            <p className={`m-0 mt-2 text-sm ${mutedClass}`}>Buyer needs 5 tons of tomatoes with no farmer response.</p>
            <button type="button" onClick={() => addAudit("Invite farmers to demand", "Tomato demand gap")}
              className="mt-2 rounded-lg border border-emerald-400/70 bg-emerald-900/30 px-3 py-2 text-xs text-emerald-100">Suggest Farmers</button>
          </article>
          <article className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-sm font-semibold">Manual Matchmaking</h3>
            <p className={`m-0 mt-2 text-sm ${mutedClass}`}>Create pilot order between selected farmer and buyer with admin oversight.</p>
            <button type="button" onClick={() => addAudit("Create manual order", "Pilot matchmaking order")}
              className="mt-2 rounded-lg border border-violet-400/70 bg-violet-900/30 px-3 py-2 text-xs text-violet-100">Create Match</button>
          </article>
        </div>
      ) : null}

      {zone === "operations" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">Active Deliveries Map</h3>
            <div className={`mt-2 rounded-lg border p-4 text-sm ${darkMode ? "border-slate-700 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
              <p className="m-0">Map placeholder: pickup to warehouse to buyer routes with status color overlays.</p>
              <p className={`m-0 mt-1 ${mutedClass}`}>Green = On schedule, Yellow = Delay risk, Red = Delayed.</p>
            </div>
            <button type="button" onClick={() => addAudit("Reassign vehicle", "Order #DLV-1023 to Truck 07")}
              className="mt-2 rounded-lg border border-yellow-400/70 bg-yellow-900/30 px-3 py-2 text-xs text-yellow-100">Reassign Vehicle/Driver</button>
          </div>

          <aside className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">Warehouse Capacity</h3>
            {["Lagos", "Kano", "Port Harcourt", "Kaduna"].map((name, index) => {
              const percent = 62 + index * 9;
              return (
                <div key={name} className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>{name}</span>
                    <span className={percent > 85 ? "text-red-300" : mutedClass}>{percent}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-700">
                    <div className={`h-2 rounded-full ${percent > 85 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </aside>
        </div>
      ) : null}

      {zone === "customer" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">Ticket System</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className={mutedClass}>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Ticket</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">From</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Priority</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-slate-800">
                      <td className="px-2 py-2">TCK-{100 + index}</td>
                      <td className="px-2 py-2">{index % 2 === 0 ? "Farmer" : "Buyer"}</td>
                      <td className="px-2 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs ${index > 3 ? "bg-red-700/30 text-red-200" : index > 1 ? "bg-yellow-700/30 text-yellow-200" : "bg-slate-700/70 text-slate-200"}`}>
                          {PRIORITIES[index % PRIORITIES.length]}
                        </span>
                      </td>
                      <td className="px-2 py-2">Agent {String.fromCharCode(65 + (index % 3))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">Broadcast Composer</h3>
            <select value={broadcastSegment} onChange={(e) => setBroadcastSegment(e.target.value)} className={`mt-2 w-full rounded-lg border px-2 py-2 text-xs ${darkMode ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"}`}>
              <option>All users</option>
              <option>All farmers</option>
              <option>All buyers</option>
              <option>Maize farmers in Kaduna</option>
            </select>
            <textarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              rows={5}
              placeholder="Type SMS/push/in-app message"
              className={`mt-2 w-full rounded-lg border px-2 py-2 text-sm ${darkMode ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"}`}
            />
            <button type="button" onClick={handleBroadcast} className="mt-2 rounded-lg border border-emerald-400/70 bg-emerald-900/30 px-3 py-2 text-xs text-emerald-100">Send Broadcast</button>
            <button type="button" onClick={() => addAudit("Schedule announcement", "Harvest season reminder")}
              className="mt-2 ml-2 rounded-lg border border-blue-400/70 bg-blue-900/30 px-3 py-2 text-xs text-blue-100">Schedule</button>
          </aside>
        </div>
      ) : null}

      {zone === "insight" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <article className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-sm font-semibold">User Growth</h3>
            <p className={`m-0 mt-2 text-sm ${mutedClass}`}>Farmers and buyers trend chart is available in main analytics section.</p>
          </article>
          <article className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-sm font-semibold">Top 5 Crops by Value</h3>
            <ul className="m-0 mt-2 list-none space-y-1 p-0 text-sm">
              {commissionByCrop.map(([crop, value]) => (
                <li key={crop} className="flex items-center justify-between">
                  <span>{crop}</span>
                  <span>{currencyFormatter.format(value)}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-sm font-semibold">Export Reports</h3>
            <div className="mt-2 grid gap-2">
              <button type="button" onClick={() => addAudit("Export report", "Monthly operations CSV")}
                className="rounded-lg border border-slate-500/70 px-3 py-2 text-xs">Monthly operations CSV</button>
              <button type="button" onClick={() => addAudit("Export report", "Loan performance PDF")}
                className="rounded-lg border border-slate-500/70 px-3 py-2 text-xs">Loan performance PDF</button>
              <button type="button" onClick={() => addAudit("Export report", "Commission summary CSV")}
                className="rounded-lg border border-slate-500/70 px-3 py-2 text-xs">Commission summary CSV</button>
            </div>
          </article>
        </div>
      ) : null}

      {zone === "admin" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">Role & Permission Matrix</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className={mutedClass}>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Role</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">User Mgmt</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Loan Terms</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Dispute Refund</th>
                    <th className="border-b border-slate-700 px-2 py-2 text-left">Logistics</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800"><td className="px-2 py-2">Super Admin</td><td className="px-2 py-2">Full</td><td className="px-2 py-2">Full</td><td className="px-2 py-2">Full</td><td className="px-2 py-2">Full</td></tr>
                  <tr className="border-b border-slate-800"><td className="px-2 py-2">Finance Admin</td><td className="px-2 py-2">View</td><td className="px-2 py-2">Edit</td><td className="px-2 py-2">Approve</td><td className="px-2 py-2">View</td></tr>
                  <tr className="border-b border-slate-800"><td className="px-2 py-2">Support Agent</td><td className="px-2 py-2">View</td><td className="px-2 py-2">No</td><td className="px-2 py-2">Escalate only</td><td className="px-2 py-2">No</td></tr>
                  <tr className="border-b border-slate-800"><td className="px-2 py-2">Logistics Coordinator</td><td className="px-2 py-2">View</td><td className="px-2 py-2">No</td><td className="px-2 py-2">No</td><td className="px-2 py-2">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <aside className={`rounded-xl border p-3 ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
            <h3 className="m-0 text-base font-semibold">Audit Log</h3>
            <div className="mt-2 grid gap-2 text-xs">
              {auditLog.length === 0 ? <p className={mutedClass}>No recent actions yet. Every destructive action will appear here.</p> : null}
              {auditLog.slice(0, 10).map((entry) => (
                <div key={entry.id} className="rounded-lg border border-slate-700/70 p-2">
                  <p className="m-0 font-semibold">{entry.action}</p>
                  <p className={`m-0 mt-1 ${mutedClass}`}>{entry.target}</p>
                  <p className={`m-0 mt-1 ${mutedClass}`}>{entry.actor} | {formatDate(entry.when)}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {pendingAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-lg rounded-xl border p-4 ${darkMode ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}>
            <h4 className="m-0 text-lg font-semibold">{pendingAction.title}</h4>
            <p className={`m-0 mt-2 text-sm ${mutedClass}`}>{pendingAction.description}</p>
            <label className="mt-3 block text-sm font-semibold">
              Reason for action
              <textarea rows={3} className={`mt-1 w-full rounded-lg border px-2 py-2 text-sm ${darkMode ? "border-slate-600 bg-slate-800" : "border-slate-300 bg-slate-50"}`} placeholder="Write reason for audit trail" />
            </label>
            <label className="mt-2 flex items-center gap-2 text-xs">
              <input type="checkbox" /> I understand this action is irreversible and will be logged.
            </label>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingAction(null)} className="rounded-lg border border-slate-500/60 px-3 py-2 text-xs">Cancel</button>
              <button type="button" onClick={pendingAction.execute} className="rounded-lg border border-red-400/70 bg-red-900/30 px-3 py-2 text-xs text-red-100">Confirm Action</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
