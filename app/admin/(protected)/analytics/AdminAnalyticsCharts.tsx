"use client";

/**
 * AdminAnalyticsCharts.tsx
 *
 * Chart.js-backed charts for the admin analytics page.
 * Loaded via next/dynamic (ssr: false) to defer the heavy chart.js bundle.
 */

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
);

const PIE_COLORS = [
  "#16a34a", "#f59e0b", "#3b82f6", "#ef4444",
  "#8b5cf6", "#10b981", "#6366f1", "#d97706",
];

export interface AdminAnalyticsChartsProps {
  monthLabels: string[];
  ordersPerMonth: number[];
  revenuePerMonth: number[];
  orderStatuses: string[];
  orderStatusData: number[];
  farmerCategories: string[];
  categoryData: number[];
  userBreakdown: {
    farmers: number;
    approvedFarmers: number;
    buyers: number;
    approvedBuyers: number;
    admins: number;
    other: number;
  };
}

export default function AdminAnalyticsCharts({
  monthLabels,
  ordersPerMonth,
  revenuePerMonth,
  orderStatuses,
  orderStatusData,
  farmerCategories,
  categoryData,
  userBreakdown,
}: AdminAnalyticsChartsProps) {
  const {
    farmers,
    approvedFarmers,
    buyers,
    approvedBuyers,
    admins,
    other,
  } = userBreakdown;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Orders per month */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Orders — Last 6 Months
        </h2>
        <Line
          data={{
            labels: monthLabels,
            datasets: [
              {
                label: "Orders",
                data: ordersPerMonth,
                borderColor: "#16a34a",
                backgroundColor: "rgba(22,163,74,0.1)",
                tension: 0.4,
                fill: true,
              },
            ],
          }}
          options={{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>

      {/* Revenue per month */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Revenue (₦) — Last 6 Months
        </h2>
        <Bar
          data={{
            labels: monthLabels,
            datasets: [
              {
                label: "Revenue",
                data: revenuePerMonth,
                backgroundColor: "#16a34a",
              },
            ],
          }}
          options={{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Order Status Breakdown
        </h2>
        <div className="max-w-xs mx-auto">
          <Pie
            data={{
              labels: orderStatuses.map(
                (s) => s.charAt(0).toUpperCase() + s.slice(1),
              ),
              datasets: [
                {
                  data: orderStatusData,
                  backgroundColor: ["#f59e0b", "#3b82f6", "#16a34a", "#ef4444"],
                },
              ],
            }}
          />
        </div>
      </div>

      {/* Farmer Categories */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Farmer Applications by Category
        </h2>
        <Bar
          data={{
            labels: farmerCategories,
            datasets: [
              {
                label: "Applications",
                data: categoryData,
                backgroundColor: PIE_COLORS,
              },
            ],
          }}
          options={{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>

      {/* User breakdown */}
      <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          User Breakdown
        </h2>
        <div className="flex flex-wrap gap-6 items-center">
          <div className="max-w-55">
            <Pie
              data={{
                labels: ["Farmers", "Buyers", "Admins", "Other"],
                datasets: [
                  {
                    data: [farmers, buyers, admins, other],
                    backgroundColor: [
                      "#16a34a",
                      "#3b82f6",
                      "#f59e0b",
                      "#d1d5db",
                    ],
                  },
                ],
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            {[
              {
                label: "Farmers",
                count: farmers,
                approved: approvedFarmers,
                color: "bg-green-500",
              },
              {
                label: "Buyers",
                count: buyers,
                approved: approvedBuyers,
                color: "bg-blue-500",
              },
              {
                label: "Admins",
                count: admins,
                approved: admins,
                color: "bg-amber-500",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border border-gray-100 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-800">{item.count}</p>
                <p className="text-xs text-gray-400">{item.approved} approved</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
