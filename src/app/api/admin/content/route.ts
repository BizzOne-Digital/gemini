import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PageContent from "@/models/PageContent";
import { getSession, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    await connectDB();
    const pages = await PageContent.find().select("pageSlug pageTitle updatedAt").sort({ pageSlug: 1 }).lean();
    return NextResponse.json(pages);
  } catch {
    return serverError("Failed to fetch pages");
  }
}
