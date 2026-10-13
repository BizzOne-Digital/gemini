import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data";
import { connectDB } from "@/lib/db";
import BookingRequest from "@/models/BookingRequest";
import ContactInquiry from "@/models/ContactInquiry";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDashboardStats();
    await connectDB();

    const [recentBookings, recentInquiries, recentActivity] = await Promise.all([
      BookingRequest.find().sort({ createdAt: -1 }).limit(5).lean(),
      ContactInquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    return NextResponse.json({
      stats,
      recentBookings,
      recentInquiries,
      recentActivity,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
