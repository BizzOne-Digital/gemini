/** Homepage highlight — Rolled Ribs (Rev 2). */
import { SITE_PHOTOS } from "@/lib/site-photos";

export const SIGNATURE_ROLLED_RIBS = {
  name: "Rolled Ribs (35 Year Favourite)",
  description:
    "Seasoned ribs stuffed with our Gram's famous breading stuffing recipe (Thursday and Friday evening only)",
  price: 19.99,
  image: SITE_PHOTOS.rolledRibs,
  imageAlt: "Homestyle rolled ribs dinner plate",
  menuHref: "/menu/lunch-and-dinner?category=homestyle-signature",
} as const;
