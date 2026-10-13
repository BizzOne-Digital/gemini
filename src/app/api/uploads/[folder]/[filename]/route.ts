import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StoredUpload from "@/models/StoredUpload";
import { isAllowedFolder, isSafeUploadPathSegment } from "@/lib/uploads";

export const runtime = "nodejs";
export const maxDuration = 15;

interface RouteParams {
  params: Promise<{ folder: string; filename: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { folder, filename } = await params;

    if (
      !isSafeUploadPathSegment(folder) ||
      !isSafeUploadPathSegment(filename) ||
      !isAllowedFolder(folder)
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const upload = await StoredUpload.findOne({ folder, filename }).lean();

    if (!upload?.data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = Buffer.from(upload.data);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": upload.mimeType,
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
