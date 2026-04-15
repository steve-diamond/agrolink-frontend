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

async function approveProduct(productId: string) {
	// Replace with your actual API call logic
	await fetch(`/api/admin/products/${productId}/approve`, { method: "POST" });
}

export default function AdminUnifiedCommandCenter({ products }: Props) {
	const [approvingProductId, setApprovingProductId] = useState<string | null>(null);

	const handleApproveProduct = async (productId: string) => {
		try {
			setApprovingProductId(productId);
			await approveProduct(productId);
		} catch (error) {
			console.error(error);
		} finally {
			setApprovingProductId(null);
		}
	};

	// Example rendering for pending products:
	return (
		<section className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4 text-slate-100">
			<h2 className="text-xl font-bold mb-4">Pending Product Approvals</h2>
			<ul>
				{products.filter(p => !p.approved).map(product => {
					const isApproving = approvingProductId === product._id;
					return (
						<li key={product._id} className="mb-2 flex items-center gap-4">
							<span>{product.name}</span>
							<button
								className="px-3 py-1 rounded bg-green-700 text-white disabled:opacity-50"
								onClick={() => handleApproveProduct(product._id)}
								disabled={isApproving}
							>
								{isApproving ? "Approving..." : "Approve"}
							</button>
						</li>
					);
				})}
			</ul>
			{/* ...rest of your dashboard... */}
		</section>
	);
}
