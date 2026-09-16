import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import { normalizeItemName, slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, notFound, serverError } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    await connectDB();
    const item = await MenuItem.findById(id).populate("category").lean();
    if (!item) return notFound("Menu item not found");

    return NextResponse.json(item);
  } catch {
    return serverError("Failed to fetch menu item");
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const item = await MenuItem.findById(id);
    if (!item) return notFound("Menu item not found");

    if (body.name) {
      body.normalizedName = normalizeItemName(body.name);
      if (!body.slug) body.slug = slugify(body.name);
    }

    Object.assign(item, body);
    await item.save();

    await logAudit({
      action: "update",
      entity: "menu_item",
      entityId: id,
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    const updated = await MenuItem.findById(id).populate("category").lean();
    return NextResponse.json(updated);
  } catch {
    return serverError("Failed to update menu item");
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    await connectDB();

    const item = await MenuItem.findByIdAndUpdate(id, { isArchived: true }, { new: true });
    if (!item) return notFound("Menu item not found");

    await logAudit({
      action: "archive",
      entity: "menu_item",
      entityId: id,
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch {
    return serverError("Failed to archive menu item");
  }
}
