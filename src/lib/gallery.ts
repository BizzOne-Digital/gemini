import fs from "fs";
import path from "path";

const GALLERY_DIR = path.join(process.cwd(), "public", "images", "gallery");
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

export type GalleryImage = {
  src: string;
  alt: string;
};

function altFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/i, "");
  const label = base.replace(/^\d+-/, "").replace(/-/g, " ");
  if (!label) return "Homestyle Diner";
  return label.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Images in public/images/gallery (top-level files). Add files there to update the gallery. */
export function getGalleryImages(): GalleryImage[] {
  if (!fs.existsSync(GALLERY_DIR)) return [];

  const files = fs
    .readdirSync(GALLERY_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && IMAGE_EXT.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return files.map((filename) => ({
    src: `/images/gallery/${encodeURIComponent(filename)}`,
    alt: altFromFilename(filename),
  }));
}
