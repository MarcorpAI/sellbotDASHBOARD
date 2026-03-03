"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatKobo, formatDateTime } from "@/lib/utils";
import { CreditBalance, CreditBundle, CreditTransaction } from "@/types";

export default function CreditsPage() {
  const [balance, setBalance] = useState<number>(0);
  const [bundles, setBundles] = useState<CreditBundle[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<CreditBalance>("/api/credits/balance"),
      api.get<CreditBundle[]>("/api/credits/bundles"),
      api.get<CreditTransaction[]>("/api/credits/transactions"),
    ])
      .then(([bal, bun, txs]) => {
        setBalance(bal.balance);
        setBundles(bun);
        setTransactions(txs);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  async function purchaseBundle(bundleId: string) {
    setPurchasing(true);
    try {
      const res = await api.post<{ authorization_url: string }>(
        "/api/credits/purchase",
        { bundle_id: bundleId }
      );
      window.open(res.authorization_url, "_blank");
    } catch (err: any) {
      alert("Failed to initialize purchase: " + (err.message || "Unknown error"));
    }
    setPurchasing(false);
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Credits</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm text-center">
        <p className="text-sm text-gray-500">Current Balance</p>
        <p className="mt-2 text-5xl font-bold text-primary-600">{balance}</p>
        <p className="mt-1 text-sm text-gray-500">credits</p>
        <div className="mt-4 rounded bg-blue-50 p-2 text-xs text-blue-700">
          💡 <b>Tip:</b> If your credits are exhausted, your AI agent will stop responding to customers.
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Buy Credits</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="rounded-lg bg-white p-6 shadow-sm text-center"
          >
            <h3 className="text-lg font-semibold">{bundle.name}</h3>
            <p className="mt-2 text-3xl font-bold">{bundle.credits}</p>
            <p className="text-sm text-gray-500">credits</p>
            <p className="mt-2 text-lg font-medium text-gray-700">
              {formatKobo(bundle.price_kobo)}
            </p>
            <p className="text-xs text-gray-400">
              {formatKobo(Math.round(bundle.price_kobo / bundle.credits))}/credit
            </p>
            <button
              onClick={() => purchaseBundle(bundle.id)}
              disabled={purchasing}
              className="mt-4 w-full rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {purchasing ? "Processing..." : "Buy Now"}
            </button>
            <p className="mt-2 text-[10px] text-gray-400">
              Opens Paystack in a new window. Ensure popups are allowed.
            </p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold">Transaction History</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 capitalize text-xs">
                    {tx.type.replace("_", " ")}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium ${tx.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {tx.description}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDateTime(tx.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
