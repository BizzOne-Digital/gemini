import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContactInquiry from "@/models/ContactInquiry";
import { getSession, unauthorized, serverError, parsePagination } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const status = searchParams.get("status");
    const reason = searchParams.get("reason");

    await connectDB();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (reason) query.reason = reason;

    const [inquiries, total] = await Promise.all([
      ContactInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContactInquiry.countDocuments(query),
    ]);

    return NextResponse.json({
      inquiries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return serverError("Failed to fetch inquiries");
  }
}
