"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { lines, updateQuantity, removeLine, itemCount } = useCart();

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [lines]
  );

  return (
    <section className="section-safe py-12 pt-[calc(var(--header-height)+2rem)]">
      <div className="container-diner mx-auto max-w-2xl">
        <h1 className="font-display text-3xl text-espresso">Your order</h1>
        <p className="mt-2 text-muted-foreground">
          Pickup at 504 Albert St, Waterloo. Pay securely with Moneris at checkout.
        </p>

        {itemCount === 0 ? (
          <div className="mt-10 rounded-2xl bg-soft-oat/50 p-10 text-center">
            <p className="font-medium text-espresso">Your cart is empty.</p>
            <Link href="/menu" className="mt-4 inline-block text-heritage-green underline">
              Browse the menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-white">
              {lines.map((line) => (
                <li
                  key={line.lineId}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-espresso">{line.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(line.unitPrice, "CAD")} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        type="button"
                        className="p-2"
                        onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="p-2"
                        onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.lineId)}
                      className="p-2 text-warm-terracotta"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between text-lg font-semibold text-espresso">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal, "CAD")}</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/menu" variant="outline" className="flex-1">
                Add more items
              </Button>
              <Button href="/order/checkout" className="flex-1">
                Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
