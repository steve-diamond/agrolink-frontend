"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FarmerWalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("NGN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchWallet() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/wallet/balance");
        setBalance(res.data.balance);
        setCurrency(res.data.currency || "NGN");
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load wallet");
      } finally {
        setLoading(false);
      }
    }
    fetchWallet();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
      <h1 className="text-2xl font-bold mb-4 text-green-800">Wallet</h1>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : error ? (
        <div className="alert">{error}</div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="text-slate-500 text-sm">Balance</div>
              <div className="text-3xl font-bold text-green-700">
                {currency} {balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <button className="button-primary px-6 py-2" disabled>
              Withdraw
            </button>
          </div>
          {/* Earnings and transactions can be added here */}
        </>
      )}
    </div>
  );
}
