"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartEntry = { name: string; value: number };
type MonthRevenue = { month: string; revenue: number };
type StatusData = { name: string; count: number };
type ProductPrice = { name: string; price: number };
type StatusTrend = {
  label: string;
  pending: number;
  paid: number;
  delivered: number;
  unknown: number;
};

type Props = {
  roleDistributionData: ChartEntry[];
  approvalData: ChartEntry[];
  orderStatusData: StatusData[];
  topProductPriceData: ProductPrice[];
  revenueTrendData: MonthRevenue[];
  orderStatusTrendData: StatusTrend[];
  currencyFormatter: Intl.NumberFormat;
};

export default function AdminCharts({
  roleDistributionData,
  approvalData,
  orderStatusData,
  topProductPriceData,
  revenueTrendData,
  orderStatusTrendData,
  currencyFormatter,
}: Props) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      <div className="h-[320px] rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
        <h3 className="m-0 text-sm font-semibold text-slate-200">User Role Distribution</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={roleDistributionData} dataKey="value" nameKey="name" outerRadius={90}>
              {roleDistributionData.map((entry, index) => (
                <Cell
                  key={`role-${entry.name}-${index}`}
                  fill={["#4f46e5", "#14b8a6", "#8b5cf6"][index % 3]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" }}
            />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[320px] rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
        <h3 className="m-0 text-sm font-semibold text-slate-200">Farmer Approval Status</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={approvalData} dataKey="value" nameKey="name" outerRadius={90}>
              {approvalData.map((entry, index) => (
                <Cell
                  key={`approval-${entry.name}-${index}`}
                  fill={["#22c55e", "#ef4444"][index % 2]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" }}
            />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[320px] rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
        <h3 className="m-0 text-sm font-semibold text-slate-200">Order Status Volume</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={orderStatusData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" }}
            />
            <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[320px] rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
        <h3 className="m-0 text-sm font-semibold text-slate-200">Top Product Prices</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={topProductPriceData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`₦${value ?? 0}`, "Price"]}
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" }}
            />
            <Bar dataKey="price" fill="#fb923c" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[320px] rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
        <h3 className="m-0 text-sm font-semibold text-slate-200">Revenue Trend (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={revenueTrendData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [
                currencyFormatter.format(Number(value ?? 0)),
                "Revenue",
              ]}
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[320px] rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
        <h3 className="m-0 text-sm font-semibold text-slate-200">Status Trend (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={orderStatusTrendData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" }}
            />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
            <Bar dataKey="pending" stackId="status" fill="#f59e0b" />
            <Bar dataKey="paid" stackId="status" fill="#0ea5e9" />
            <Bar dataKey="delivered" stackId="status" fill="#22c55e" />
            <Bar dataKey="unknown" stackId="status" fill="#64748b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
