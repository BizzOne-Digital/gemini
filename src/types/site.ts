export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface SiteSettingsData {
  publicBusinessName: string;
  legalBusinessName: string;
  primaryEmail: string;
  notificationEmail: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  mapUrl?: string;
  directionsUrl?: string;
  timezone: string;
  businessHours: BusinessHours[];
  facebookUrl?: string;
  instagramUrl?: string;
  orderOnlineUrl?: string;
  logos: {
    main?: string;
    light?: string;
    dark?: string;
    mobile?: string;
    favicon?: string;
    footer?: string;
    altText: string;
  };
  announcementBar: {
    enabled: boolean;
    message: string;
    link?: string;
  };
  footerDescription: string;
  currency: string;
  pricingDisclaimer: string;
  bookingEnabled: boolean;
  cateringEnabled: boolean;
  newsletterEnabled: boolean;
  parkingNotes?: string;
  accessibilityNotes?: string;
}

export interface NavLink {
  label: string;
  href: string;
  displayOrder: number;
  isVisible: boolean;
  openInNewTab: boolean;
}

export interface NavigationData {
  links: NavLink[];
}

export interface MenuCategoryData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  startingPrice?: number;
  displayOrder: number;
  isFeatured: boolean;
}

export interface MenuItemData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  currency: string;
  category: MenuCategoryData | string;
  image?: string;
  imageAlt?: string;
  dietaryTags: string[];
  allergens: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  displayOrder: number;
}

export interface ServiceData {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  image?: string;
  imageAlt?: string;
  icon?: string;
  ctaLabel: string;
  ctaHref: string;
  isFeatured: boolean;
}

export interface TestimonialData {
  _id: string;
  customerName: string;
  customerPhoto?: string;
  rating: number;
  reviewText: string;
  visitType?: string;
  isFeatured: boolean;
  reviewDate: string;
}

export interface PageSection {
  key: string;
  heading?: string;
  subheading?: string;
  description?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  image?: string;
  imageAlt?: string;
  isVisible: boolean;
  displayOrder: number;
  metadata?: Record<string, unknown>;
}

export const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: "Monday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
  { day: "Tuesday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
  { day: "Wednesday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
  { day: "Thursday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
  { day: "Friday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
  { day: "Saturday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
  { day: "Sunday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
];

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  publicBusinessName: "Homestyle Diner",
  legalBusinessName: "Gemini-SR Enterprise Inc. O/A Gemini Homestyle Diner",
  primaryEmail: "homestylewaterloo@gmail.com",
  notificationEmail: "homestylewaterloo@gmail.com",
  phone: "519-725-5048",
  address: "504 Albert St",
  city: "Waterloo",
  province: "ON",
  postalCode: "N2L 3V4",
  country: "Canada",
  mapUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2896.8!2d-80.5449!3d43.4723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDI4JzIwLjMiTiA4MMKwMzInNDEuNiJX!5e0!3m2!1sen!2sca!4v1",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=504+Albert+St,+Waterloo,+ON+N2L+3V4",
  timezone: "America/Toronto",
  businessHours: DEFAULT_BUSINESS_HOURS,
  facebookUrl: "https://www.facebook.com/Homestyledinerwaterloo/",
  instagramUrl: "https://www.instagram.com/homestyledinerwaterloo/",
  orderOnlineUrl: "",
  logos: {
    main: "/images/logo.png",
    footer: "/images/logo.png",
    favicon: "/favicon.png",
    altText: "Homestyle Diner",
  },
  announcementBar: { enabled: false, message: "" },
  footerDescription:
    "Family-owned and operated in Waterloo since 1987. Homemade comfort food, served with heart.",
  currency: "CAD",
  pricingDisclaimer:
    "Menu items, pricing, and availability are subject to change.",
  bookingEnabled: true,
  cateringEnabled: true,
  newsletterEnabled: false,
};

export function getSection(
  sections: PageSection[] | undefined,
  key: string
): PageSection | undefined {
  return sections?.find((s) => s.key === key && s.isVisible !== false);
}

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function getHoursPerDay(hours: BusinessHours[]) {
  const sorted = [...hours].sort(
    (a, b) => DAY_ORDER.indexOf(a.day as typeof DAY_ORDER[number]) - DAY_ORDER.indexOf(b.day as typeof DAY_ORDER[number])
  );
  return sorted.map((h) => ({
    day: h.day,
    line: h.isClosed ? "Closed" : `${h.open} – ${h.close}`,
  }));
}

const JS_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function getTodayHoursLine(hours: BusinessHours[]): string {
  const dayName = JS_WEEKDAYS[new Date().getDay()];
  const entry = hours.find((h) => h.day === dayName);
  if (!entry) return "See hours below";
  if (entry.isClosed) return `${dayName}: Closed today`;
  return `Today (${dayName}): ${entry.open} – ${entry.close}`;
}

/** Compact one-line summary for legacy uses */
export function formatHoursSummary(hours: BusinessHours[]): string {
  return getHoursPerDay(hours)
    .map(({ day, line }) => `${day.slice(0, 3)} ${line}`)
    .join(" · ");
}

export function getPhoneHref(phone: string): string {
  return `tel:${phone.replace(/\D/g, "")}`;
}

export function getFullAddress(settings: SiteSettingsData): string {
  return `${settings.address}, ${settings.city}, ${settings.province} ${settings.postalCode}`;
}
