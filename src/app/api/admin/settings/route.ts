import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models";
import { getSiteSettings } from "@/lib/data";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch {
    return serverError("Failed to fetch settings");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    await connectDB();

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }

    await logAudit({
      action: "update",
      entity: "site_settings",
      entityId: settings._id.toString(),
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(JSON.parse(JSON.stringify(settings)));
  } catch {
    return serverError("Failed to update settings");
  }
}
