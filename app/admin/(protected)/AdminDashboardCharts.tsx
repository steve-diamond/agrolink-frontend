"use client";

/**
 * AdminDashboardCharts.tsx
 *
 * Chart.js-backed charts for the admin dashboard summary.
 * Loaded via next/dynamic (ssr: false) to defer the ~300 KB chart.js bundle
 * until the component is actually needed on the client.
 */

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
);

interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor: string | string[];
}

export interface AdminDashboardChartsData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface AdminDashboardChartsProps {
  farmerChartData: AdminDashboardChartsData;
  orderChartData: AdminDashboardChartsData;
}

export default function AdminDashboardCharts({
  farmerChartData,
  orderChartData,
}: AdminDashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Farmer Applications by Category
        </h2>
        <Bar data={farmerChartData} />
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
        <Pie data={orderChartData} />
      </div>
    </div>
  );
}
