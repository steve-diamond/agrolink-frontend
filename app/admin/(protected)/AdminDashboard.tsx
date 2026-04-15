"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

export default function AdminDashboard() {
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    if (!token) return;
    axios.get("/api/farmers", { headers: { Authorization: token } })
      .then(res => setFarmers(res.data))
      .catch(err => console.error(err));

    axios.get("/api/products", { headers: { Authorization: token } })
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));

    axios.get("/api/orders", { headers: { Authorization: token } })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, [token]);

  // Farmer category analytics
  const farmerCategories = ["Arable", "Livestock", "Horticultural", "Poultry", "Fish", "Organic", "Dairy", "Mixed"];
  const categoryCounts = farmerCategories.map(cat =>
    farmers.filter(f => f.category === cat).length
  );

  const farmerChartData = {
    labels: farmerCategories,
    datasets: [
      {
        label: "Farmers by Category",
        data: categoryCounts,
        backgroundColor: [
          "#16a34a", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#10b981", "#6366f1", "#d97706"
        ]
      }
    ]
  };

  const orderStatusCounts = ["Pending", "Shipped", "Delivered"].map(status =>
    orders.filter(o => o.status === status).length
  );

  const orderChartData = {
    labels: ["Pending", "Shipped", "Delivered"],
    datasets: [
      {
        label: "Orders",
        data: orderStatusCounts,
        backgroundColor: ["#f59e0b", "#3b82f6", "#16a34a"]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Total Farmers</h2>
          <p className="text-2xl font-bold text-green-700">{farmers.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Verified Farmers</h2>
          <p className="text-2xl font-bold text-green-700">{farmers.filter(f => f.verified).length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Pending Products</h2>
          <p className="text-2xl font-bold text-green-700">{products.filter(p => !p.approved).length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Active Orders</h2>
          <p className="text-2xl font-bold text-green-700">{orders.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Farmers by Category</h2>
          <Bar data={farmerChartData} />
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Orders Status</h2>
          <Pie data={orderChartData} />
        </div>
      </div>

      {/* Pending Products */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Pending Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.filter(p => !p.approved).map(product => (
            <div key={product._id} className="bg-white shadow rounded-lg p-4">
              <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded mb-3" />
              <h3 className="text-lg font-bold">{product.name}</h3>
              <p>{product.description}</p>
              <p className="text-green-700 font-bold">₦{product.price}</p>
              <button
                onClick={() => axios.put(`/api/products/${product._id}/approve`, {}, { headers: { Authorization: token } })}
                className="bg-green-700 text-white px-4 py-2 rounded mt-2 hover:bg-green-800"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Orders Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Orders</h2>
        <table className="w-full bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="p-2">Order ID</th>
              <th className="p-2">Product</th>
              <th className="p-2">Buyer</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-b">
                <td className="p-2">{order._id}</td>
                <td className="p-2">{order.productId}</td>
                <td className="p-2">{order.buyer}</td>
                <td className="p-2">{order.quantity}</td>
                <td className="p-2">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
