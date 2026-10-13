import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getSiteSettings } from "@/lib/data";
import {
  computeOrderTotals,
  generateOrderNumber,
  type CartLine,
} from "@/lib/order-utils";
import {
  isMonerisConfigured,
  monerisCheckoutUrl,
  requestMonerisCheckoutTicket,
} from "@/lib/moneris";

const lineSchema = z.object({
  lineId: z.string(),
  name: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  unitPrice: z.number().min(0),
  menuItemId: z.string().optional(),
  shopProductId: z.string().optional(),
  source: z.enum(["menu", "shop", "customize"]),
  requiresShipping: z.boolean().optional(),
});

const checkoutSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7).max(30),
  fulfillment: z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().max(500).optional(),
  pickupTime: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
  lines: z.array(lineSchema).min(1),
});

export async function POST(req: NextRequest) {
  try {
    if (!isMonerisConfigured()) {
      return NextResponse.json(
        {
          error:
            "Online payments are not configured yet. Please call the restaurant to place your order.",
        },
        { status: 503 }
      );
    }

    const body = checkoutSchema.parse(await req.json());
    const settings = await getSiteSettings();

    if (body.fulfillment === "delivery" && !settings.deliveryEnabled) {
      return NextResponse.json(
        { error: "Delivery is not available for online orders." },
        { status: 400 }
      );
    }

    if (
      body.fulfillment === "delivery" &&
      !body.deliveryAddress?.trim()
    ) {
      return NextResponse.json(
        { error: "Delivery address is required." },
        { status: 400 }
      );
    }

    const lines = body.lines as CartLine[];
    const source = lines[0]?.source ?? "menu";
    const taxRate = settings.orderTaxRate ?? 0.13;
    const totals = computeOrderTotals(lines, {
      taxRate,
      fulfillment: body.fulfillment,
      shippingFlat: 0,
    });

    const orderNumber = generateOrderNumber();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.homestylediner.ca";

    await connectDB();

    const order = await Order.create({
      orderNumber,
      source,
      fulfillment: body.fulfillment,
      status: "pending_payment",
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      deliveryAddress: body.deliveryAddress,
      pickupTime: body.pickupTime,
      notes: body.notes,
      lineItems: lines.map((l) => ({
        lineId: l.lineId,
        name: l.name,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        menuItemId: l.menuItemId,
        shopProductId: l.shopProductId,
      })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      total: totals.total,
      currency: settings.currency || "CAD",
    });

    const { ticket } = await requestMonerisCheckoutTicket({
      orderNumber: order.orderNumber,
      total: totals.total,
      customerEmail: body.customerEmail,
      siteUrl,
    });

    order.monerisTicket = ticket;
    await order.save();

    return NextResponse.json({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      checkoutUrl: monerisCheckoutUrl(
        process.env.MONERIS_ENV === "prod" ? "prod" : "qa",
        ticket
      ),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
