import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteStoredUploadByUrl, handleImageUpload } from "@/lib/uploads";

export const runtime = "nodejs";
export const maxDuration = 30;

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

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const deleted = await deleteStoredUploadByUrl(url);
    return NextResponse.json({ success: deleted });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
