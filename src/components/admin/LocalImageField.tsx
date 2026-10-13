"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ImageIcon, RefreshCw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resolveImageSrc } from "@/lib/resolve-image";
import type { StoredUploadFolder } from "@/models/StoredUpload";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

interface LocalImageFieldProps {
  value?: string;
  folder: StoredUploadFolder;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
}

async function deleteStoredUpload(url: string) {
  if (!url.startsWith("/api/uploads/")) return;
  await fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" });
}

export function LocalImageField({
  value,
  folder,
  onChange,
  className,
  label,
}: LocalImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const inputId = `local-image-${folder}-${label?.replace(/\s+/g, "-").toLowerCase() || "field"}`;

  const upload = useCallback(
    async (file: File, previousUrl?: string) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        if (previousUrl) {
          await deleteStoredUpload(previousUrl);
        }

        onChange(data.url);
        toast.success("Image uploaded");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file, value);
    e.target.value = "";
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await deleteStoredUpload(value);
      } catch {
        toast.error("Failed to delete stored image");
        return;
      }
    }
    onChange("");
    toast.success("Image removed");
  };

  const displaySrc = resolveImageSrc(value);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}

      {value ? (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
          <div className="relative h-40 w-full">
            <Image
              src={displaySrc}
              alt={label || "Uploaded image"}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex gap-2 border-t border-border p-2">
            <label
              htmlFor={inputId}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-xs font-medium hover:bg-muted/50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {uploading ? "Uploading..." : "Replace"}
            </label>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            uploading ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50"
          )}
        >
          {uploading ? (
            <p className="text-sm text-muted-foreground">Uploading...</p>
          ) : (
            <>
              <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload an image</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                <Upload className="h-4 w-4" />
                Choose File
              </span>
            </>
          )}
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="hidden"
        disabled={uploading}
        onChange={handleFileChange}
      />
    </div>
  );
}
