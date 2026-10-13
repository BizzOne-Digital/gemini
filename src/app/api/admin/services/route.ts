import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, badRequest, serverError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    await connectDB();
    const services = await Service.find({ isArchived: false }).sort({ displayOrder: 1 }).lean();
    return NextResponse.json(services);
  } catch {
    return serverError("Failed to fetch services");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    if (!body.title || !body.shortDescription || !body.fullDescription) {
      return badRequest("Title and descriptions are required");
    }

    await connectDB();
    const slug = body.slug || slugify(body.title);
    const existing = await Service.findOne({ slug });
    if (existing) return badRequest("Service with this slug already exists");

    const service = await Service.create({ ...body, slug });

    await logAudit({
      action: "create",
      entity: "service",
      entityId: service._id.toString(),
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(service, { status: 201 });
  } catch {
    return serverError("Failed to create service");
  }
}
