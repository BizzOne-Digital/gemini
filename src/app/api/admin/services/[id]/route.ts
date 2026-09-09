import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { slugify } from "@/lib/utils";
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
    const service = await Service.findById(id);
    if (!service) return notFound("Service not found");

    if (body.title && !body.slug) body.slug = slugify(body.title);
    Object.assign(service, body);
    await service.save();

    await logAudit({
      action: "update",
      entity: "service",
      entityId: id,
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(service);
  } catch {
    return serverError("Failed to update service");
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    await connectDB();

    const service = await Service.findByIdAndUpdate(
      id,
      { isArchived: true, isActive: false },
      { new: true }
    );
    if (!service) return notFound("Service not found");

    await logAudit({
      action: "archive",
      entity: "service",
      entityId: id,
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch {
    return serverError("Failed to delete service");
  }
}
