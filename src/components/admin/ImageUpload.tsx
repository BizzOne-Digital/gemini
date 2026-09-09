"use client";

import { LocalImageField } from "./LocalImageField";
import type { StoredUploadFolder } from "@/models/StoredUpload";

interface ImageUploadProps {
  value?: string;
  altText?: string;
  folder: string;
  onChange: (url: string, altText?: string) => void;
  onAltChange?: (alt: string) => void;
  className?: string;
}

const LEGACY_FOLDER_MAP: Record<string, StoredUploadFolder> = {
  "homestyle/logo": "misc",
  "homestyle/hero": "gallery",
  "homestyle/menu": "products",
  "homestyle/services": "products",
  "homestyle/gallery": "gallery",
  "homestyle/testimonials": "gallery",
  "homestyle/pages": "pages",
  "homestyle/misc": "misc",
};

function resolveFolder(folder: string): StoredUploadFolder {
  if (["products", "gallery", "pages", "misc"].includes(folder)) {
    return folder as StoredUploadFolder;
  }
  return LEGACY_FOLDER_MAP[folder] ?? "misc";
}

/** @deprecated Use LocalImageField directly */
export function ImageUpload({
  value,
  altText = "",
  folder,
  onChange,
  onAltChange,
  className,
}: ImageUploadProps) {
  return (
    <div className={className}>
      <LocalImageField
        value={value}
        folder={resolveFolder(folder)}
        onChange={(url) => onChange(url, altText)}
      />
      {onAltChange && (
        <input
          type="text"
          placeholder="Alt text for accessibility"
          value={altText}
          onChange={(e) => onAltChange(e.target.value)}
          className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}
    </div>
  );
}
