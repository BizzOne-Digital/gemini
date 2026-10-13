import { randomBytes } from "crypto";
import { connectDB } from "./db";
import StoredUpload, { type StoredUploadFolder } from "@/models/StoredUpload";

export const UPLOAD_FOLDERS: StoredUploadFolder[] = [
  "products",
  "gallery",
  "pages",
  "misc",
];

export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isAllowedFolder(folder: string): folder is StoredUploadFolder {
  return UPLOAD_FOLDERS.includes(folder as StoredUploadFolder);
}

export function isAllowedMimeType(mimeType: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

export function extensionForMime(mimeType: string): string | null {
  return MIME_TO_EXT[mimeType] ?? null;
}

export function generateUploadFilename(mimeType: string): string {
  const ext = extensionForMime(mimeType);
  if (!ext) {
    throw new Error("Unsupported mime type");
  }
  return `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
}

export function buildUploadUrl(folder: StoredUploadFolder, filename: string): string {
  return `/api/uploads/${folder}/${filename}`;
}

export function parseStoredUploadUrl(
  url: string
): { folder: StoredUploadFolder; filename: string } | null {
  const match = url.match(/^\/api\/uploads\/([^/]+)\/([^/]+)$/);
  if (!match) return null;

  const folder = match[1];
  const filename = match[2];

  if (
    !isAllowedFolder(folder) ||
    folder.includes("..") ||
    filename.includes("..") ||
    filename.includes("/")
  ) {
    return null;
  }

  return { folder, filename };
}

export function isSafeUploadPathSegment(value: string): boolean {
  return (
    value.length > 0 &&
    !value.includes("..") &&
    !value.includes("/") &&
    !value.includes("\\")
  );
}

export async function deleteStoredUploadByUrl(url: string): Promise<boolean> {
  const parsed = parseStoredUploadUrl(url);
  if (!parsed) return false;

  await connectDB();
  const result = await StoredUpload.deleteOne({
    folder: parsed.folder,
    filename: parsed.filename,
  });

  return result.deletedCount > 0;
}

export async function saveStoredUpload(
  folder: StoredUploadFolder,
  filename: string,
  mimeType: string,
  data: Buffer
) {
  await connectDB();
  return StoredUpload.create({
    folder,
    filename,
    mimeType,
    size: data.length,
    data,
  });
}

export type UploadResult =
  | { ok: true; url: string; filename: string; size: number; folder: StoredUploadFolder }
  | { ok: false; status: number; error: string };

export async function handleImageUpload(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File | null;
  const folder = formData.get("folder") as string;

  if (!file || !folder) {
    return { ok: false, status: 400, error: "File and folder are required" };
  }

  if (!isAllowedFolder(folder)) {
    return { ok: false, status: 400, error: "Invalid folder" };
  }

  if (!isAllowedMimeType(file.type)) {
    return {
      ok: false,
      status: 400,
      error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF",
    };
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return { ok: false, status: 400, error: "File too large (max 8MB)" };
  }

  const ext = extensionForMime(file.type);
  if (!ext) {
    return { ok: false, status: 400, error: "Invalid file type" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = generateUploadFilename(file.type);

  await saveStoredUpload(folder, filename, file.type, buffer);

  return {
    ok: true,
    url: buildUploadUrl(folder, filename),
    filename,
    size: buffer.length,
    folder,
  };
}
