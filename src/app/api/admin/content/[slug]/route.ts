import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PageContent from "@/models/PageContent";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, notFound, badRequest, serverError } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { slug } = await params;
    await connectDB();
    const page = await PageContent.findOne({ pageSlug: slug }).lean();
    if (!page) return notFound("Page content not found");

    return NextResponse.json(page);
  } catch {
    return serverError("Failed to fetch page content");
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { slug } = await params;
    const body = await req.json();

    if (!body.pageTitle) return badRequest("pageTitle is required");

    await connectDB();
    const page = await PageContent.findOneAndUpdate(
      { pageSlug: slug },
      { ...body, pageSlug: slug },
      { new: true, upsert: true, runValidators: true }
    );

    await logAudit({
      action: "update",
      entity: "page_content",
      entityId: page._id.toString(),
      details: { slug },
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json(page);
  } catch {
    return serverError("Failed to update page content");
  }
}
