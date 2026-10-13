export const IMAGE_PLACEHOLDER = "/images/placeholder.svg";

/** Resolve image URLs for display; legacy disk `/uploads/...` paths use a placeholder. */
export function resolveImageSrc(
  url?: string | null,
  fallback: string = IMAGE_PLACEHOLDER
): string {
  if (!url) return fallback;
  if (url.startsWith("/uploads/")) return fallback;
  return url;
}
