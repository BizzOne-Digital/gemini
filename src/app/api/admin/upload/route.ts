import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleImageUpload } from "@/lib/uploads";

export const runtime = "nodejs";

/** Backward-compatible alias for POST /api/upload */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const result = await handleImageUpload(formData);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
      size: result.size,
      folder: result.folder,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
