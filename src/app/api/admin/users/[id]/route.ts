import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, forbidden, notFound, serverError } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(["super_admin"]);
    if (!session) {
      const anySession = await getSession();
      if (!anySession) return unauthorized();
      return forbidden();
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const user = await AdminUser.findById(id);
    if (!user) return notFound("User not found");

    if (body.name) user.name = body.name;
    if (body.email) user.email = body.email.toLowerCase();
    if (body.role) user.role = body.role;
    if (body.isActive !== undefined) user.isActive = body.isActive;
    if (body.password) user.password = await bcrypt.hash(body.password, 12);

    await user.save();

    await logAudit({
      action: "update",
      entity: "admin_user",
      entityId: id,
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    const updated = await AdminUser.findById(id).select("-password").lean();
    return NextResponse.json(updated);
  } catch {
    return serverError("Failed to update user");
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(["super_admin"]);
    if (!session) {
      const anySession = await getSession();
      if (!anySession) return unauthorized();
      return forbidden();
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await connectDB();
    const user = await AdminUser.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user) return notFound("User not found");

    await logAudit({
      action: "deactivate",
      entity: "admin_user",
      entityId: id,
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch {
    return serverError("Failed to delete user");
  }
}
