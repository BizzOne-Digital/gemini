import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getSiteSettings } from "@/lib/data";
import { sendOrderNotification } from "@/lib/order-email";

const confirmSchema = z.object({
  orderNumber: z.string().min(1),
  transactionId: z.string().optional(),
  responseCode: z.string().optional(),
});

/** Called from success page after Moneris Checkout returns. */
export async function POST(req: NextRequest) {
  try {
    const body = confirmSchema.parse(await req.json());
    await connectDB();

    const order = await Order.findOne({ orderNumber: body.orderNumber });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "paid" || order.status === "in_kitchen") {
      return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
    }

    const code = body.responseCode || "";
    const approved = !code || code.startsWith("0") || code === "00" || code === "027";

    if (!approved && body.responseCode) {
      order.status = "payment_failed";
      order.monerisResponseCode = body.responseCode;
      await order.save();
      return NextResponse.json({ error: "Payment was not approved." }, { status: 402 });
    }

    order.status = "paid";
    order.monerisTransactionId = body.transactionId;
    order.monerisResponseCode = body.responseCode;
    order.paidAt = new Date();
    await order.save();

    const settings = await getSiteSettings();
    await sendOrderNotification(order, settings.notificationEmail);

    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
