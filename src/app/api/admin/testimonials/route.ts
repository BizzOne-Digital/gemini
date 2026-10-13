import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, badRequest, serverError, parsePagination } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const status = searchParams.get("status");

    await connectDB();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const [testimonials, total] = await Promise.all([
      Testimonial.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Testimonial.countDocuments(query),
    ]);

    return NextResponse.json({
      testimonials,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return serverError("Failed to fetch testimonials");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    if (!body.customerName || !body.reviewText || !body.rating) {
      return badRequest("Customer name, review text, and rating are required");
    }

    await connectDB();
    const testimonial = await Testimonial.create(body);

    await logAudit({
      action: "create",
      entity: "testimonial",
      entityId: testimonial._id.toString(),
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch {
    return serverError("Failed to create testimonial");
  }
}
