"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";

const DESIGN_FEE = 5;

export default function CustomizePage() {
  const { addLine } = useCart();
  const [notes, setNotes] = useState("");

  function handleAdd() {
    if (!notes.trim()) {
      toast.error("Please describe your design preference.");
      return;
    }
    addLine({
      name: `Custom design preference — ${notes.trim().slice(0, 80)}`,
      unitPrice: DESIGN_FEE,
      source: "customize",
      quantity: 1,
    });
    toast.success("Design fee added to your order");
    setNotes("");
  }

  return (
    <section className="section-safe py-12 pt-[calc(var(--header-height)+2rem)]">
      <div className="container-diner mx-auto max-w-xl">
        <h1 className="font-display text-3xl text-espresso">I prefer your design</h1>
        <p className="mt-3 text-muted-foreground">
          Add a ${DESIGN_FEE.toFixed(2)} CAD fee when you&apos;d like our team to handle
          creative direction. Continue to cart and checkout to pay with Moneris.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-border bg-white p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Your notes</label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm"
              placeholder="Tell us what you're looking for…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button type="button" onClick={handleAdd} className="w-full">
            Add ${DESIGN_FEE.toFixed(2)} fee to order
          </Button>
          <Button href="/order/cart" variant="outline" className="w-full">
            View cart & checkout
          </Button>
        </div>
      </div>
    </section>
  );
}
