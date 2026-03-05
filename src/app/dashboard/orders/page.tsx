"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNaira, formatDateTime, statusColor } from "@/lib/utils";
import { Order } from "@/types";

const STATUSES = ["all", "pending_payment", "awaiting_confirmation", "paid", "fulfilled", "cancelled", "abandoned"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = filter === "all" ? "" : `?status=${filter}`;
    api
      .get<Order[]>(`/api/orders${params}`)
      .then(setOrders)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [filter]);

  async function updateStatus(orderId: string, status: string) {
    try {
      const updated = await api.patch<Order>(`/api/orders/${orderId}/status`, {
        status,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      setSelected(updated);
    } catch { }
  }

  async function confirmPayment(orderId: string) {
    setActionLoading(true);
    try {
      const updated = await api.post<Order>(`/api/orders/${orderId}/confirm-payment`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      setSelected(updated);
    } catch { }
    setActionLoading(false);
  }

  async function rejectPayment(orderId: string) {
    setActionLoading(true);
    try {
      const updated = await api.post<Order>(`/api/orders/${orderId}/reject-payment`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      setSelected(updated);
    } catch { }
    setActionLoading(false);
  }

  const paymentModeLabel = (mode: string | null) => {
    const labels: Record<string, string> = {
      paystack: "Card / USSD",
      paystack_virtual: "Virtual Account",
      manual_transfer: "Manual Transfer",
    };
    return mode ? labels[mode] || mode : "—";
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-sm capitalize whitespace-nowrap ${filter === s
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {paymentModeLabel(order.payment_mode)}
                  </td>
                  <td className="px-4 py-3">{formatNaira(order.total_amount)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDateTime(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(order)}
                      className="text-primary-600 hover:underline text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Order Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p><strong>ID:</strong> {selected.id}</p>
              <p><strong>Status:</strong>{" "}
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(selected.status)}`}>
                  {selected.status.replace(/_/g, " ")}
                </span>
              </p>
              <p><strong>Payment Mode:</strong> {paymentModeLabel(selected.payment_mode)}</p>
              <p><strong>Total:</strong> {formatNaira(selected.total_amount)}</p>
              {selected.shipping_fee && (
                <p><strong>Shipping Fee:</strong> {formatNaira(selected.shipping_fee)}</p>
              )}
              <p><strong>Created:</strong> {formatDateTime(selected.created_at)}</p>
              {selected.paid_at && (
                <p><strong>Paid:</strong> {formatDateTime(selected.paid_at)}</p>
              )}
              {selected.confirmed_at && (
                <p><strong>Confirmed:</strong> {formatDateTime(selected.confirmed_at)} by {selected.confirmed_by}</p>
              )}
              {selected.virtual_account_no && (
                <div className="rounded bg-blue-50 p-3">
                  <p className="text-xs font-medium text-blue-700">Virtual Account</p>
                  <p className="text-sm">{selected.virtual_bank_name} — {selected.virtual_account_no}</p>
                </div>
              )}

              {/* Payment Proof */}
              {selected.payment_proof_url && (
                <div className="rounded border border-orange-200 bg-orange-50 p-3">
                  <p className="mb-2 text-xs font-medium text-orange-700">Payment Proof</p>
                  <a
                    href={selected.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={selected.payment_proof_url}
                      alt="Payment proof"
                      className="max-h-48 rounded border cursor-pointer hover:opacity-80 transition"
                    />
                  </a>
                  <p className="mt-1 text-xs text-gray-500">Click to view full size</p>
                </div>
              )}

              {selected.delivery_info && (
                <div>
                  <strong>Delivery:</strong>
                  <pre className="mt-1 rounded bg-gray-50 p-2 text-xs">
                    {JSON.stringify(selected.delivery_info, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <strong>Items:</strong>
                <ul className="mt-1 space-y-1">
                  {selected.items.map((item) => (
                    <li key={item.id} className="text-xs text-gray-600">
                      {item.quantity}x {item.product_name} - {formatNaira(item.price)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confirm / Reject for awaiting_confirmation */}
              {selected.status === "awaiting_confirmation" && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => confirmPayment(selected.id)}
                    disabled={actionLoading}
                    className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading ? "…" : "✅ Confirm Payment"}
                  </button>
                  <button
                    onClick={() => rejectPayment(selected.id)}
                    disabled={actionLoading}
                    className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? "…" : "❌ Reject Proof"}
                  </button>
                </div>
              )}

              {selected.status === "paid" && (
                <button
                  onClick={() => updateStatus(selected.id, "fulfilled")}
                  className="mt-4 w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Mark as Fulfilled
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
