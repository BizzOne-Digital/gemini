import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BookingRequest from "@/models/BookingRequest";
import { getSession, unauthorized, serverError, parsePagination } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    await connectDB();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { referenceNumber: { $regex: search, $options: "i" } },
      ];
    }

    const [bookings, total] = await Promise.all([
      BookingRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BookingRequest.countDocuments(query),
    ]);

    return NextResponse.json({
      bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return serverError("Failed to fetch bookings");
  }
}
