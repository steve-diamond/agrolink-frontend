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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "16px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "14px",
          height: "320px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>User Role Distribution</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={roleDistributionData} dataKey="value" nameKey="name" outerRadius={90}>
              {roleDistributionData.map((entry, index) => (
                <Cell
                  key={`role-${entry.name}-${index}`}
                  fill={["#2563eb", "#0f766e", "#7c3aed"][index % 3]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "14px",
          height: "320px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Farmer Approval Status</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={approvalData} dataKey="value" nameKey="name" outerRadius={90}>
              {approvalData.map((entry, index) => (
                <Cell
                  key={`approval-${entry.name}-${index}`}
                  fill={["#16a34a", "#dc2626"][index % 2]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "14px",
          height: "320px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Order Status Volume</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={orderStatusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "14px",
          height: "320px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Top Product Prices</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={topProductPriceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`₦${value ?? 0}`, "Price"]} />
            <Bar dataKey="price" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "14px",
          height: "320px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Revenue Trend (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={revenueTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value) => [
                currencyFormatter.format(Number(value ?? 0)),
                "Revenue",
              ]}
            />
            <Line type="monotone" dataKey="revenue" stroke="#0891b2" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "14px",
          height: "320px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Status Trend (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={orderStatusTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
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
