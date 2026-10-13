import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, notFound, serverError } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return notFound("Testimonial not found");

    Object.assign(testimonial, body);
    await testimonial.save();

    await logAudit({
      action: body.status === "approved" ? "approve" : body.status === "rejected" ? "reject" : "update",
      entity: "testimonial",
      entityId: id,
      details: { status: body.status },
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(testimonial);
  } catch {
    return serverError("Failed to update testimonial");
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    await connectDB();

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    );
    if (!testimonial) return notFound("Testimonial not found");

    await logAudit({
      action: "archive",
      entity: "testimonial",
      entityId: id,
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch {
    return serverError("Failed to delete testimonial");
  }
}
