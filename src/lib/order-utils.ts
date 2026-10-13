import type { OrderSource } from "@/models/Order";

export type CartLine = {
  lineId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  menuItemId?: string;
  shopProductId?: string;
  source: OrderSource;
  requiresShipping?: boolean;
};

export function computeOrderTotals(
  lines: CartLine[],
  options: {
    taxRate: number;
    fulfillment: "pickup" | "delivery";
    shippingFlat?: number;
  }
) {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0
  );
  const needsShipping = lines.some((l) => l.requiresShipping);
  const shipping =
    options.fulfillment === "delivery" || needsShipping
      ? options.shippingFlat ?? 0
      : 0;
  const taxable = subtotal + shipping;
  const tax = Math.round(taxable * options.taxRate * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  return { subtotal, tax, shipping, total };
}

export function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HD-${stamp}-${rand}`;
}
