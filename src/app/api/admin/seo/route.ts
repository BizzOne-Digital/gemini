import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SeoSettings } from "@/models";
import { getSeoSettings } from "@/lib/data";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const seo = await getSeoSettings();
    return NextResponse.json(seo);
  } catch {
    return serverError("Failed to fetch SEO settings");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    await connectDB();

    let seo = await SeoSettings.findOne();
    if (!seo) {
      seo = await SeoSettings.create(body);
    } else {
      Object.assign(seo, body);
      await seo.save();
    }

    await logAudit({
      action: "update",
      entity: "seo_settings",
      entityId: seo._id.toString(),
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(JSON.parse(JSON.stringify(seo)));
  } catch {
    return serverError("Failed to update SEO settings");
  }
}
