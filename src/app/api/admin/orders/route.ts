import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getSession, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const status = req.nextUrl.searchParams.get("status");
    await connectDB();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(orders);
  } catch {
    return serverError("Failed to load orders");
  }
}
