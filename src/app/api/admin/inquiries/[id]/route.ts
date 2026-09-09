import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContactInquiry from "@/models/ContactInquiry";
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
    const inquiry = await ContactInquiry.findByIdAndUpdate(id, body, { new: true });
    if (!inquiry) return notFound("Inquiry not found");

    await logAudit({
      action: "update",
      entity: "inquiry",
      entityId: id,
      details: { status: body.status },
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(inquiry);
  } catch {
    return serverError("Failed to update inquiry");
  }
}
