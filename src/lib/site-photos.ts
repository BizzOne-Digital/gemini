/**
 * Client photos in public/images/Photos (URL-encoded for Next.js Image).
 */
const BASE = "/images/Photos";

export function photoUrl(filename: string): string {
  return `${BASE}/${encodeURIComponent(filename)}`;
}

export const SITE_PHOTOS = {
  /** Hero — breakfast spread (public/images/hero-breakfast.jpg) */
  hero: "/images/hero-breakfast.jpg",
  /** Welcome / dine-in interior with chalkboard */
  welcome: photoUrl("1 (4).JPEG"),
  /** Bakery — chocolate-topped cream pie */
  bakery: photoUrl("WhatsApp Image 2026-09-11 at 12.11.36 PM.jpeg"),
  bakeryAlt: photoUrl("WhatsApp Image 2026-09-13 at 12.42.10 PM.jpeg"),
  /** About — neon sign feature wall */
  about: photoUrl("WhatsApp Image 2026-09-11 at 12.04.31 PM.jpeg"),
  /** Menu / featured food */
  foodFishChips: photoUrl("WhatsApp Image 2026-09-11 at 12.12.59 PM.jpeg"),
  foodDinner: photoUrl("WhatsApp Image 2026-09-11 at 12.27.00 PM.jpeg"),
  foodFishTray: photoUrl("WhatsApp Image 2026-09-11 at 12.10.31 PM.jpeg"),
  /** Catering trays */
  catering: photoUrl("WhatsApp Image 2026-09-13 at 12.42.08 PM.jpeg"),
  /** Group / interior */
  groupDining: photoUrl("1 (4).JPEG"),
  /** Gallery — services / category highlights */
  breakfastBenedict: "/images/gallery/20-eggs-benedict.png",
  lunchBurger: "/images/gallery/09-bacon-cheeseburger.png",
  rolledRibs: "/images/gallery/03-homestyle-dinner-plate.png",
} as const;

/** Rotating defaults when menu/category has no image */
export const MENU_PHOTO_FALLBACKS = [
  SITE_PHOTOS.foodFishTray,
  SITE_PHOTOS.foodFishChips,
  SITE_PHOTOS.foodDinner,
  SITE_PHOTOS.bakery,
  SITE_PHOTOS.catering,
];

export function menuPhotoFallback(index: number): string {
  return MENU_PHOTO_FALLBACKS[index % MENU_PHOTO_FALLBACKS.length];
}
