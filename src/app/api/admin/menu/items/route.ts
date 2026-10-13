import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import { slugify, normalizeItemName } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, badRequest, serverError, parsePagination } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const popular = searchParams.get("popular");
    const available = searchParams.get("available");
    const archived = searchParams.get("archived");

    await connectDB();

    const query: Record<string, unknown> = {};
    if (archived === "true") query.isArchived = true;
    else query.isArchived = false;
    if (category) query.category = category;
    if (featured === "true") query.isFeatured = true;
    if (popular === "true") query.isPopular = true;
    if (available === "true") query.isAvailable = true;
    if (available === "false") query.isAvailable = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      MenuItem.find(query).populate("category").sort({ displayOrder: 1 }).skip(skip).limit(limit).lean(),
      MenuItem.countDocuments(query),
    ]);

    return NextResponse.json({
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return serverError("Failed to fetch menu items");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    if (!body.name || !body.price || !body.category) {
      return badRequest("Name, price, and category are required");
    }

    await connectDB();

    const slug = body.slug || slugify(body.name);
    const existing = await MenuItem.findOne({ slug });
    if (existing) return badRequest("An item with this slug already exists");

    const item = await MenuItem.create({
      ...body,
      slug,
      normalizedName: normalizeItemName(body.name),
    });

    await logAudit({
      action: "create",
      entity: "menu_item",
      entityId: item._id.toString(),
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    const populated = await MenuItem.findById(item._id).populate("category").lean();
    return NextResponse.json(populated, { status: 201 });
  } catch {
    return serverError("Failed to create menu item");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const { ids, updates } = body as { ids: string[]; updates: Record<string, unknown> };

    if (!ids?.length || !updates) {
      return badRequest("ids and updates are required");
    }

    await connectDB();
    const result = await MenuItem.updateMany({ _id: { $in: ids } }, { $set: updates });

    await logAudit({
      action: "bulk_update",
      entity: "menu_item",
      details: { ids, updates, modified: result.modifiedCount },
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json({ modified: result.modifiedCount });
  } catch {
    return serverError("Failed to bulk update menu items");
  }
}
