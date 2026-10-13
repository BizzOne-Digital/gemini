import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MenuCategory from "@/models/MenuCategory";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, badRequest, serverError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    await connectDB();
    const categories = await MenuCategory.find({ isArchived: false }).sort({ displayOrder: 1 }).lean();
    return NextResponse.json(categories);
  } catch {
    return serverError("Failed to fetch categories");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    if (!body.name) return badRequest("Name is required");

    await connectDB();
    const slug = body.slug || slugify(body.name);
    const existing = await MenuCategory.findOne({ slug });
    if (existing) return badRequest("Category with this slug already exists");

    const category = await MenuCategory.create({ ...body, slug });

    await logAudit({
      action: "create",
      entity: "menu_category",
      entityId: category._id.toString(),
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return serverError("Failed to create category");
  }
}
