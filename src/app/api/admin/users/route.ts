import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, forbidden, badRequest, serverError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getSession(["super_admin"]);
    if (!session) {
      const anySession = await getSession();
      if (!anySession) return unauthorized();
      return forbidden();
    }

    await connectDB();
    const users = await AdminUser.find().select("-password").sort({ createdAt: -1 }).lean();
    return NextResponse.json(users);
  } catch {
    return serverError("Failed to fetch users");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(["super_admin"]);
    if (!session) {
      const anySession = await getSession();
      if (!anySession) return unauthorized();
      return forbidden();
    }

    const body = await req.json();
    if (!body.name || !body.email || !body.password) {
      return badRequest("Name, email, and password are required");
    }

    await connectDB();
    const existing = await AdminUser.findOne({ email: body.email.toLowerCase() });
    if (existing) return badRequest("User with this email already exists");

    const hashedPassword = await bcrypt.hash(body.password, 12);
    const user = await AdminUser.create({
      name: body.name,
      email: body.email.toLowerCase(),
      password: hashedPassword,
      role: body.role || "content_editor",
      isActive: body.isActive ?? true,
    });

    await logAudit({
      action: "create",
      entity: "admin_user",
      entityId: user._id.toString(),
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch {
    return serverError("Failed to create user");
  }
}
