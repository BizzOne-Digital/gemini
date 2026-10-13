"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/useDeferredEffect";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

type OrderRow = {
  _id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  fulfillment: string;
  total: number;
  currency: string;
  lineItems: { name: string; quantity: number }[];
  createdAt: string;
};

const STATUS_OPTIONS = [
  "paid",
  "in_kitchen",
  "ready",
  "completed",
  "cancelled",
  "pending_payment",
  "payment_failed",
];

export default function KitchenOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useDeferredEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Order updated");
      void load();
    } else {
      toast.error("Update failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Kitchen orders</h1>
        <p className="text-sm text-muted-foreground">
          Paid online orders appear here for pickup or delivery prep.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order._id}
              className="rounded-xl border border-border bg-white p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName} · {order.customerPhone} ·{" "}
                    {order.fulfillment}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="font-semibold text-heritage-green">
                  {formatPrice(order.total, order.currency)}
                </p>
              </div>
              <ul className="mt-3 text-sm">
                {order.lineItems?.map((line, i) => (
                  <li key={i}>
                    {line.quantity}× {line.name}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
