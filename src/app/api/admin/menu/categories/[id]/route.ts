import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MenuCategory from "@/models/MenuCategory";
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
    const category = await MenuCategory.findById(id);
    if (!category) return notFound("Category not found");

    if (body.name && !body.slug) body.slug = slugify(body.name);
    Object.assign(category, body);
    await category.save();

    await logAudit({
      action: "update",
      entity: "menu_category",
      entityId: id,
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(category);
  } catch {
    return serverError("Failed to update category");
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    await connectDB();

    const category = await MenuCategory.findByIdAndUpdate(
      id,
      { isArchived: true, isActive: false },
      { new: true }
    );
    if (!category) return notFound("Category not found");

    await logAudit({
      action: "archive",
      entity: "menu_category",
      entityId: id,
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch {
    return serverError("Failed to delete category");
  }
}
