import React from 'react';
import Image from 'next/image';
import { useCartStore } from 'store/cart';
import { getPaystackUrl } from 'lib/paystack';

export default function CheckoutPage() {
  const cartItems = useCartStore((s) => s.cartItems);
  const total = useCartStore((s) => s.total)();
  const clearCart = useCartStore((s) => s.clearCart);

  const handleCheckout = () => {
    // In production, use logged-in user's email and generate unique reference
    const email = 'testuser@example.com';
    const reference = 'REF-' + Date.now();
    const amount = total * 100; // Paystack expects kobo
    const paystackUrl = getPaystackUrl({
      email,
      amount,
      reference,
      metadata: { cart: cartItems },
    });
    window.location.href = paystackUrl;
    clearCart();
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-[#2D6A4F]">Checkout</h1>
      {cartItems.length === 0 ? (
        <div className="text-gray-500">Your cart is empty.</div>
      ) : (
        <div className="space-y-6">
          <ul className="divide-y">
            {cartItems.map((item) => (
              <li key={item.id} className="py-4 flex items-center gap-4">
                <Image src={item.image_url || '/placeholder.png'} alt={item.name} width={64} height={64} className="w-16 h-16 rounded object-cover" />
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.brand}</div>
                  <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                </div>
                <div className="font-bold">₦{(item.price_per_unit * item.quantity).toLocaleString()}</div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
          <button className="btn bg-[#2D6A4F] text-white w-full" onClick={handleCheckout}>
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
}
