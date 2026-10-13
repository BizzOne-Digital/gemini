import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BookingRequest from "@/models/BookingRequest";
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
    const booking = await BookingRequest.findById(id);
    if (!booking) return notFound("Booking not found");

    if (body.status && body.status !== booking.status) {
      booking.statusHistory.push({
        status: body.status,
        note: body.note,
        changedAt: new Date(),
        changedBy: session.user.email,
      });
      booking.status = body.status;
    }

    if (body.adminNotes !== undefined) booking.adminNotes = body.adminNotes;
    await booking.save();

    await logAudit({
      action: "update",
      entity: "booking",
      entityId: id,
      details: { status: body.status },
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(booking);
  } catch {
    return serverError("Failed to update booking");
  }
}
