const DEFAULT_INSTAGRAM = "https://www.instagram.com/homestyle.diner/?hl=en";

/** Ensure Instagram links work when admins paste handles or partial URLs. */
export function normalizeInstagramUrl(url?: string | null): string {
  const raw = url?.trim();
  if (!raw) return DEFAULT_INSTAGRAM;

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const handle = raw
    .replace(/^@/, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^www\.instagram\.com\//i, "")
    .split(/[/?#]/)[0];

  if (!handle) return DEFAULT_INSTAGRAM;

  return `https://www.instagram.com/${handle}/?hl=en`;
}
