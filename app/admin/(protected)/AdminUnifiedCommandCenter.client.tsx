
"use client";
import React from "react";


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







import { useState } from "react";

export default function AdminUnifiedCommandCenter({ users, products, orders, currencyFormatter }: Props) {
	const [approvingProductId, setApprovingProductId] = useState<string | null>(null);
	const handleApproveProduct = async (id: string) => {
		setApprovingProductId(id);
		try {
			// Example: call your API endpoint to approve the product
			await fetch(`/api/admin/products/${id}/approve`, { method: "POST" });
			// Optionally, refresh data or update state here
		} finally {
			setApprovingProductId(null);
		}
	};
	return (
		<section className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4 text-slate-100">
			{/* ...existing JSX code... (unchanged) */}
		</section>
	);
}
