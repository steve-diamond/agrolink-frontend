"use client";

import { useState } from "react";
import API from "@/services/api";

type Product = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  location: string;
  farmer: string;
};

export default function MarketplacePage() {
  const [products] = useState<Product[]>([
    {
      _id: "demo-1",
      name: "Maize",
      price: 1200,
      quantity: 50,
      location: "Kaduna",
      farmer: "Farmer A",
    },
    {
      _id: "demo-2",
      name: "Rice",
      price: 2100,
      quantity: 30,
      location: "Kano",
      farmer: "Farmer B",
    },
  ]);

  const handleBuy = async (productId: string, price: number) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user._id) {
      alert("Login first");
      return;
    }

    try {
      // 1. Create order
      const orderRes = await API.post("/api/orders", {
        productId,
        buyerId: user._id,
        quantity: 1,
      });

      const order = orderRes.data;

      // 2. Initialize payment
      const paymentRes = await API.post("/api/payment/initialize", {
        email: user.email,
        amount: order.totalPrice,
        orderId: order._id,
        callback_url: `${window.location.origin}/payment-success`,
      });

      // 3. Redirect to Paystack
      window.location.href = paymentRes.data.data.authorization_url;

    } catch (error) {
      console.error(error);
      alert("Payment failed");
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Marketplace</h1>
      <p>Buy produce from farmers.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        {products.map((product) => (
          <article key={product._id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>{product.name}</h2>
            <p>Price: NGN {product.price.toLocaleString()}</p>
            <p>Quantity: {product.quantity}</p>
            <p>Location: {product.location}</p>
            <p>Farmer: {product.farmer}</p>
            <button type="button" onClick={() => handleBuy(product._id, product.price)}>
              Buy Now
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
