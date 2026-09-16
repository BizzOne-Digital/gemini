import fs from "fs";
import path from "path";

const PHOTOS_DIR = path.join(process.cwd(), "public", "images", "Photos");
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

export type GalleryImage = {
  src: string;
  alt: string;
};

/** Files in public/images/Photos — add images there to update the gallery. */
export function getGalleryImages(): GalleryImage[] {
  if (!fs.existsSync(PHOTOS_DIR)) return [];

  const files = fs
    .readdirSync(PHOTOS_DIR)
    .filter((name) => IMAGE_EXT.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return files.map((filename) => ({
    src: `/images/Photos/${encodeURIComponent(filename)}`,
    alt: "Homestyle Diner",
  }));
}
