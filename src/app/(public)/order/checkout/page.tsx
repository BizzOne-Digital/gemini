"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/components/providers/CartProvider";
import { computeOrderTotals } from "@/lib/order-utils";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const TAX_RATE = 0.13;

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clearCart, itemCount } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    fulfillment: "pickup" as "pickup" | "delivery",
    deliveryAddress: "",
    pickupTime: "",
    notes: "",
  });

  const totals = useMemo(
    () =>
      computeOrderTotals(lines, {
        taxRate: TAX_RATE,
        fulfillment: form.fulfillment,
      }),
    [lines, form.fulfillment]
  );

  if (itemCount === 0) {
    return (
      <section className="section-safe py-12 pt-[calc(var(--header-height)+2rem)]">
        <div className="container-diner max-w-lg text-center">
          <p>Your cart is empty.</p>
          <Link href="/menu" className="mt-4 inline-block text-heritage-green underline">
            Back to menu
          </Link>
        </div>
      </section>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lines }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Checkout failed");
        return;
      }
      sessionStorage.setItem("pendingOrderNumber", data.orderNumber);
      clearCart();
      window.location.href = data.checkoutUrl;
    } catch {
      toast.error("Unable to start payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-safe py-12 pt-[calc(var(--header-height)+2rem)]">
      <div className="container-diner mx-auto max-w-2xl">
        <h1 className="font-display text-3xl text-espresso">Checkout</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="Your name"
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.customerEmail}
            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
          />
          <Input
            label="Phone"
            required
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
          />

          <div>
            <p className="mb-2 text-sm font-medium">Fulfillment</p>
            <div className="flex gap-3">
              {(["pickup", "delivery"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForm({ ...form, fulfillment: f })}
                  className={`rounded-full border px-4 py-2 text-sm capitalize ${
                    form.fulfillment === f
                      ? "border-heritage-green bg-heritage-green/10 text-heritage-green"
                      : "border-border"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {form.fulfillment === "pickup" ? (
            <Input
              label="Preferred pickup time (optional)"
              placeholder="e.g. Today at 12:30 PM"
              value={form.pickupTime}
              onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
            />
          ) : (
            <Input
              label="Delivery address"
              required
              value={form.deliveryAddress}
              onChange={(e) =>
                setForm({ ...form, deliveryAddress: e.target.value })
              }
            />
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Order notes</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="rounded-xl bg-soft-oat/60 p-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(totals.subtotal, "CAD")}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Tax (HST)</span>
              <span>{formatPrice(totals.tax, "CAD")}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold text-espresso">
              <span>Total</span>
              <span>{formatPrice(totals.total, "CAD")}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/order/cart")}>
              Back
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Redirecting to Moneris…" : "Pay with Moneris"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
