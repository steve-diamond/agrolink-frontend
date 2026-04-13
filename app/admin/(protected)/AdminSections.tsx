"use client";

type UserCardItem = {
  _id: string;
  email: string;
  role: string;
  approved?: boolean;
};

type ProductCardItem = {
  _id: string;
  name: string;
  price: number;
  approved?: boolean;
};

type OrderCardItem = {
  _id: string;
  status: string;
  paymentStatus?: string;
};

type TopProductPrice = {
  name: string;
  price: number;
};

const TOP_COMMODITY_WIDTH_CLASSES = ["w-[35%]", "w-[55%]", "w-[75%]"] as const;

export function OverviewSidebar({
  rangeLabel,
  pendingFarmerCount,
  pendingProductCount,
}: {
  rangeLabel: string;
  pendingFarmerCount: number;
  pendingProductCount: number;
}) {
  return (
    <aside className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4">
      <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Overview</p>
      <div className="mt-3 grid gap-2 text-sm">
        <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2">
          <p className="m-0 text-xs text-slate-400">Active Range</p>
          <p className="m-0 mt-1 font-semibold text-emerald-200">{rangeLabel}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2">
          <p className="m-0 text-xs text-slate-400">Pending Approvals</p>
          <p className="m-0 mt-1 font-semibold text-amber-200">{pendingFarmerCount} farmers</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2">
          <p className="m-0 text-xs text-slate-400">Pending Products</p>
          <p className="m-0 mt-1 font-semibold text-sky-200">{pendingProductCount} listings</p>
        </div>
      </div>

      <p className="mt-6 text-xs uppercase tracking-[0.1em] text-slate-400">Quick Menu</p>
      <ul className="m-0 mt-2 grid list-none gap-1 p-0 text-sm text-slate-300">
        <li className="rounded-lg bg-emerald-700/20 px-3 py-2 text-emerald-200">Dashboard</li>
        <li className="rounded-lg px-3 py-2">Approvals</li>
        <li className="rounded-lg px-3 py-2">Commerce</li>
        <li className="rounded-lg px-3 py-2">Reports</li>
        <li className="rounded-lg px-3 py-2">Insights</li>
      </ul>
    </aside>
  );
}

export function TopCommodityCards({
  products,
  currencyFormatter,
}: {
  products: TopProductPrice[];
  currencyFormatter: Intl.NumberFormat;
}) {
  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
      {products.slice(0, 3).map((product, index) => (
        <article key={product.name} className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
          <p className="m-0 text-[11px] uppercase tracking-[0.08em] text-slate-400">Top Commodity {index + 1}</p>
          <h3 className="m-0 mt-2 text-base font-semibold text-slate-100">{product.name}</h3>
          <p className="m-0 mt-1 text-emerald-300">{currencyFormatter.format(Number(product.price || 0))}</p>
          <div className="mt-3 h-2 rounded-full bg-slate-700">
            <div
              className={`h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 ${
                TOP_COMMODITY_WIDTH_CLASSES[index] ?? TOP_COMMODITY_WIDTH_CLASSES[2]
              }`}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

export function ControlRoomSidebar({
  totalUsers,
  totalProducts,
  totalOrders,
  pendingFarmerCount,
  pendingProductCount,
  totalRevenue,
  rangeLabel,
  currencyFormatter,
}: {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingFarmerCount: number;
  pendingProductCount: number;
  totalRevenue: number;
  rangeLabel: string;
  currencyFormatter: Intl.NumberFormat;
}) {
  return (
    <aside className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4">
      <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Plan</p>
      <div className="mt-2 rounded-2xl border border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/15 to-indigo-500/10 p-4">
        <p className="m-0 text-xs text-fuchsia-200">DOS AGROLINK Intelligence</p>
        <h3 className="m-0 mt-2 text-lg font-semibold text-white">Operational Analysis</h3>
        <p className="mt-2 text-sm text-slate-300">Track approvals, market activity, and revenue momentum from one executive panel.</p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
        <h3 className="m-0 text-sm font-semibold text-slate-200">Live Snapshot</h3>
        <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-sm">
          <li className="flex items-center justify-between"><span className="text-slate-400">Users</span><strong>{totalUsers}</strong></li>
          <li className="flex items-center justify-between"><span className="text-slate-400">Products</span><strong>{totalProducts}</strong></li>
          <li className="flex items-center justify-between"><span className="text-slate-400">Orders</span><strong>{totalOrders}</strong></li>
          <li className="flex items-center justify-between"><span className="text-slate-400">Pending Farmers</span><strong>{pendingFarmerCount}</strong></li>
        </ul>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
        <h3 className="m-0 text-sm font-semibold text-slate-200">Operational Alerts</h3>
        <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-sm text-slate-300">
          <li className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2">
            {pendingFarmerCount} farmers pending approval review.
          </li>
          <li className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2">
            {pendingProductCount} product listings awaiting action.
          </li>
          <li className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2">
            Revenue window: {currencyFormatter.format(totalRevenue)} in {rangeLabel.toLowerCase()}.
          </li>
        </ul>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
        <h3 className="m-0 text-sm font-semibold text-slate-200">DOS Vision Assistant</h3>
        <p className="mt-2 text-sm text-slate-300">Ask operational questions and align daily actions with DOS AGROLINK vision outcomes.</p>
        <div className="mt-3 grid gap-2">
          <button className="cursor-pointer rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-left text-xs text-slate-200">
            Which approvals block marketplace growth this week?
          </button>
          <button className="cursor-pointer rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-left text-xs text-slate-200">
            Show top value-chain opportunities by order demand.
          </button>
        </div>
        <button className="mt-3 w-full cursor-pointer rounded-xl border border-emerald-400/70 bg-emerald-700/30 px-3 py-2 text-sm font-semibold text-emerald-100">
          Run Quick Review
        </button>
      </div>
    </aside>
  );
}

export function OperationsUsersCard({
  users,
  onApproveFarmer,
}: {
  users: UserCardItem[];
  onApproveFarmer: (id: string) => void;
}) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
      <h3 className="m-0 text-sm font-semibold text-slate-200">Users</h3>
      <div className="mt-2 grid gap-1 text-sm text-slate-300">
        {users.slice(0, 5).map((u) => (
          <div key={u._id} className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1">
            <div className="font-medium">{u.email}</div>
            <div className="text-xs text-slate-400">
              {u.role} {u.role === "farmer" ? `• ${u.approved ? "Approved" : "Pending"}` : ""}
            </div>
            {u.role === "farmer" && !u.approved ? (
              <button
                onClick={() => onApproveFarmer(u._id)}
                className="mt-1 cursor-pointer rounded-md border border-emerald-400/60 bg-emerald-700/30 px-2 py-1 text-xs text-emerald-100"
              >
                Approve
              </button>
            ) : null}
          </div>
        ))}
        {users.length === 0 ? <p className="m-0 text-xs text-slate-500">No users match your search.</p> : null}
      </div>
    </article>
  );
}

export function OperationsProductsCard({
  products,
  deleting,
  currencyFormatter,
  onApproveProduct,
  onDeleteProduct,
}: {
  products: ProductCardItem[];
  deleting: string | null;
  currencyFormatter: Intl.NumberFormat;
  onApproveProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
}) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
      <h3 className="m-0 text-sm font-semibold text-slate-200">Products</h3>
      <div className="mt-2 grid gap-1 text-sm text-slate-300">
        {products.slice(0, 5).map((p) => (
          <div key={p._id} className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1">
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-slate-400">{currencyFormatter.format(Number(p.price || 0))}</div>
            <div className="mt-1 flex gap-1">
              {!p.approved ? (
                <button
                  onClick={() => onApproveProduct(p._id)}
                  disabled={deleting === p._id}
                  className="cursor-pointer rounded-md border border-emerald-400/60 bg-emerald-700/30 px-2 py-1 text-xs text-emerald-100 disabled:opacity-60"
                >
                  Approve
                </button>
              ) : null}
              <button
                onClick={() => onDeleteProduct(p._id)}
                disabled={deleting === p._id}
                className="cursor-pointer rounded-md border border-rose-400/60 bg-rose-700/30 px-2 py-1 text-xs text-rose-100 disabled:opacity-60"
              >
                {deleting === p._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 ? <p className="m-0 text-xs text-slate-500">No products match your search.</p> : null}
      </div>
    </article>
  );
}

export function OperationsOrdersCard<TOrder extends OrderCardItem>({
  orders,
  currencyFormatter,
  getOrderSummary,
  getOrderTotal,
}: {
  orders: TOrder[];
  currencyFormatter: Intl.NumberFormat;
  getOrderSummary: (order: TOrder) => string;
  getOrderTotal: (order: TOrder) => number;
}) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
      <h3 className="m-0 text-sm font-semibold text-slate-200">Orders</h3>
      <div className="mt-2 grid gap-1 text-sm text-slate-300">
        {orders.slice(0, 5).map((o) => (
          <div key={o._id} className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1">
            <div className="font-medium">{getOrderSummary(o)}</div>
            <div className="text-xs text-slate-400 capitalize">{o.status || "unknown"} / {o.paymentStatus || "pending"}</div>
            <div className="text-xs text-emerald-200">{currencyFormatter.format(getOrderTotal(o))}</div>
          </div>
        ))}
        {orders.length === 0 ? <p className="m-0 text-xs text-slate-500">No orders match your search.</p> : null}
      </div>
    </article>
  );
}
