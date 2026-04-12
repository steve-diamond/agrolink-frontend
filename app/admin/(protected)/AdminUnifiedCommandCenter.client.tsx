"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// ...existing code from AdminUnifiedCommandCenter.tsx...

type InputUser = {
	_id: string;
	name: string;
	email: string;
	role: string;
	approved?: boolean;
	category?: string;
};

type InputProduct = {
	_id: string;
	name: string;
	description?: string;
	image?: string;
	imageUrl?: string;
	price: number;
	approved?: boolean;
	category?: string;
	farmer?: string | { _id?: string };
};

type InputOrder = {
	_id: string;
	status: string;
	quantity?: number;
	buyer?: string;
	buyerId?: {
		name?: string;
		email?: string;
	};
	productId?: string | { _id?: string; name?: string };
	products?: Array<{ quantity: number; productId?: { _id?: string; name?: string } | string }>;
};

type Props = {
	users: InputUser[];
	products: InputProduct[];
	orders: InputOrder[];
	currencyFormatter: Intl.NumberFormat;
	// Remove onApproveProduct from server props, implement in client
};

const FARMER_CATEGORIES = ["Arable", "Livestock", "Horticultural", "Poultry", "Fish", "Organic", "Dairy", "Mixed"];
const ORDER_STATUSES = ["Pending", "Shipped", "Delivered"];

const cardClass = "rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4";
const tooltipStyle = {
	background: "#0f172a",
	border: "1px solid #334155",
	borderRadius: 10,
	color: "#e2e8f0",
} as const;

function normalizeFarmerCategory(raw?: string): (typeof FARMER_CATEGORIES)[number] | null {
	const value = String(raw || "").trim().toLowerCase();
	if (!value) return null;
	if (value.includes("mixed")) return "Mixed";
	if (value.includes("organic")) return "Organic";
	if (value.includes("dairy") || value.includes("milk")) return "Dairy";
	if (value.includes("fish") || value.includes("aquaculture")) return "Fish";
	if (value.includes("poultry") || value.includes("chicken") || value.includes("egg")) return "Poultry";
	if (
		value.includes("hort") ||
		value.includes("vegetable") ||
		value.includes("fruit") ||
		value.includes("tomato") ||
		value.includes("pepper")
	) return "Horticultural";
	if (
		value.includes("livestock") ||
		value.includes("cattle") ||
		value.includes("goat") ||
		value.includes("sheep") ||
		value.includes("animal")
	) return "Livestock";
	if (
		value.includes("arable") ||
		value.includes("maize") ||
		value.includes("rice") ||
		value.includes("yam") ||
		value.includes("cassava") ||
		value.includes("grain") ||
		value.includes("crop")
	) return "Arable";
	return null;
}

function normalizeOrderStatus(raw?: string): (typeof ORDER_STATUSES)[number] | "Unknown" {
	const value = String(raw || "").trim().toLowerCase();
	if (value === "pending") return "Pending";
	if (value === "shipped") return "Shipped";
	if (value === "delivered") return "Delivered";
	return "Unknown";
}

export default function AdminUnifiedCommandCenter({ users, products, orders, currencyFormatter }: Props) {
	const farmers = useMemo(() => users.filter((u) => u.role === "farmer"), [users]);
	const verifiedFarmersCount = useMemo(() => farmers.filter((f) => f.approved).length, [farmers]);
	const pendingProducts = useMemo(() => products.filter((p) => !p.approved), [products]);

	function resolveOrderProduct(order: any) {
		if (order.productId && typeof order.productId === "object" && order.productId.name) return order.productId.name;
		if (order.productId && typeof order.productId === "string") {
			const prod = products.find((p) => p._id === order.productId);
			return prod ? prod.name : "Unknown";
		}
		if (order.products && Array.isArray(order.products) && order.products.length > 0) {
			const prod = order.products[0].productId;
			if (typeof prod === "object" && prod.name) return prod.name;
			if (typeof prod === "string") {
				const p = products.find((pp) => pp._id === prod);
				return p ? p.name : "Unknown";
			}
		}
		return "Unknown";
	}

	function resolveOrderBuyer(order: any) {
		if (order.buyerId && typeof order.buyerId === "object" && order.buyerId.name) return order.buyerId.name;
		if (order.buyer && typeof order.buyer === "string") return order.buyer;
		return "Unknown";
	}

	function resolveOrderQuantity(order: any) {
		if (typeof order.quantity === "number") return order.quantity;
		if (order.products && Array.isArray(order.products)) {
			return order.products.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
		}
		return "-";
	}

	function getOrderStatusBadgeClass(status: string) {
		const s = String(status || "").toLowerCase();
		if (s === "pending") return "bg-amber-900/40 text-amber-300";
		if (s === "shipped") return "bg-blue-900/40 text-blue-300";
		if (s === "delivered") return "bg-green-900/40 text-green-300";
		return "bg-slate-700 text-slate-300";
	}

	// Approve product handler (client-side)
	const [approvingProductId, setApprovingProductId] = useState<string | null>(null);
	const handleApproveProduct = async (id: string) => {
		setApprovingProductId(id);
		try {
			await fetch(`/api/products/${id}/approve`, { method: "POST" });
			// Optionally refetch data or show a notification
		} finally {
			setApprovingProductId(null);
		}
	};

	const farmerCategoryData = useMemo(() => {
		return FARMER_CATEGORIES.map((cat) => ({
			category: cat,
			count: farmers.filter((f) => normalizeFarmerCategory(f.category) === cat).length,
		}));
	}, [farmers]);

	const orderStatusData = useMemo(() => {
		return [
			{ name: "Pending", value: orders.filter((o) => normalizeOrderStatus(o.status) === "Pending").length },
			{ name: "Shipped", value: orders.filter((o) => normalizeOrderStatus(o.status) === "Shipped").length },
			{ name: "Delivered", value: orders.filter((o) => normalizeOrderStatus(o.status) === "Delivered").length },
		];
	}, [orders]);

	return (
		<section className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4 text-slate-100">
			{/* ...existing JSX code... (unchanged) */}
		</section>
	);
}
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// ...existing code from AdminUnifiedCommandCenter.tsx...
// (Will copy the full content in the next step)
