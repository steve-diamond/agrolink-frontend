"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";

export default function FarmerWalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("NGN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({ accountName: "", accountNumber: "", bankName: "" });
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  useEffect(() => {
    async function fetchWallet() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/wallet/balance");
        setBalance(res.data.balance);
        setCurrency(res.data.currency || "NGN");
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: unknown }).response === "object" &&
          (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ) {
          setError((err as { response: { data: { message?: string } } }).response.data.message || "Failed to load wallet");
        } else {
          setError("Failed to load wallet");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchWallet();
  }, []);

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setWithdrawing(true);
    setWithdrawError("");
    setWithdrawSuccess("");
    try {
      await axios.post("/api/withdrawals/request", {
        amount: Number(withdrawAmount),
        bankDetails,
      });
      setWithdrawSuccess("Withdrawal request submitted!");
      setShowWithdraw(false);
      setWithdrawAmount("");
      setBankDetails({ accountName: "", accountNumber: "", bankName: "" });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: unknown }).response === "object" &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        setWithdrawError((err as { response: { data: { message?: string } } }).response.data.message || "Failed to submit withdrawal request");
      } else {
        setWithdrawError("Failed to submit withdrawal request");
      }
    } finally {
      setWithdrawing(false);
    }
  }

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
            <button className="button-primary px-6 py-2" onClick={() => setShowWithdraw(true)}>
              Withdraw
            </button>
          </div>
          {withdrawSuccess && <div className="alert alert-success mb-4">{withdrawSuccess}</div>}
          {withdrawError && <div className="alert alert-error mb-4">{withdrawError}</div>}
          {showWithdraw && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <form
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200 animate-fade-in"
                onSubmit={handleWithdraw}
              >
                <h2 className="text-2xl font-bold mb-6 text-green-800 flex items-center gap-2">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4" /></svg>
                  Withdraw Funds
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Amount</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Enter amount"
                    className="input input-bordered w-full rounded-lg border-slate-300 focus:border-green-500 focus:ring-green-200"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Account Name"
                    className="input input-bordered w-full rounded-lg border-slate-300 focus:border-green-500 focus:ring-green-200"
                    value={bankDetails.accountName}
                    onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="Account Number"
                    className="input input-bordered w-full rounded-lg border-slate-300 focus:border-green-500 focus:ring-green-200"
                    value={bankDetails.accountNumber}
                    onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Bank Name"
                    className="input input-bordered w-full rounded-lg border-slate-300 focus:border-green-500 focus:ring-green-200"
                    value={bankDetails.bankName}
                    onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    type="submit"
                    className="rounded-md bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold shadow transition"
                    disabled={withdrawing}
                  >
                    {withdrawing ? "Submitting..." : "Submit"}
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 font-semibold shadow transition"
                    onClick={() => setShowWithdraw(false)}
                    disabled={withdrawing}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          {/* Earnings and transactions can be added here */}
        </>
      )}
    </div>
  );
}
