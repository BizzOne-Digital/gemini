import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Navigation } from "@/models";
import { getNavigation } from "@/lib/data";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const navigation = await getNavigation();
    return NextResponse.json(navigation);
  } catch {
    return serverError("Failed to fetch navigation");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    await connectDB();

    let nav = await Navigation.findOne();
    if (!nav) {
      nav = await Navigation.create(body);
    } else {
      Object.assign(nav, body);
      await nav.save();
    }

    await logAudit({
      action: "update",
      entity: "navigation",
      entityId: nav._id.toString(),
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(JSON.parse(JSON.stringify(nav)));
  } catch {
    return serverError("Failed to update navigation");
  }
}
