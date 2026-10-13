import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StoredUpload from "@/models/StoredUpload";
import { buildUploadUrl, deleteStoredUploadByUrl, UPLOAD_FOLDERS } from "@/lib/uploads";
import { logAudit } from "@/lib/audit";
import { getSession, unauthorized, badRequest, serverError, parsePagination } from "@/lib/api-helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const folder = searchParams.get("folder");
    const search = searchParams.get("search");

    await connectDB();

    const query: Record<string, unknown> = {};
    if (folder) query.folder = folder;
    if (search) {
      query.filename = { $regex: search, $options: "i" };
    }

    const [uploads, total] = await Promise.all([
      StoredUpload.find(query)
        .select("folder filename mimeType size createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StoredUpload.countDocuments(query),
    ]);

    const assets = uploads.map((upload) => ({
      _id: upload._id,
      url: buildUploadUrl(upload.folder, upload.filename),
      filename: upload.filename,
      folder: upload.folder,
      format: upload.mimeType.split("/")[1],
      bytes: upload.size,
      createdAt: upload.createdAt,
    }));

    return NextResponse.json({
      assets,
      folders: UPLOAD_FOLDERS,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return serverError("Failed to fetch media");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    const url = searchParams.get("url");

    await connectDB();

    if (url) {
      const deleted = await deleteStoredUploadByUrl(url);
      if (!deleted) return badRequest("Upload not found");
    } else if (id) {
      const upload = await StoredUpload.findById(id).lean();
      if (!upload) return badRequest("Asset not found");
      await deleteStoredUploadByUrl(buildUploadUrl(upload.folder, upload.filename));
    } else {
      return badRequest("id or url is required");
    }

    await logAudit({
      action: "delete",
      entity: "media",
      entityId: id || url || "unknown",
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch {
    return serverError("Failed to delete media");
  }
}
