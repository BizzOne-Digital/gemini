import {
  getSiteSettings,
  getNavigation,
  getPageContent,
  getMenuCategories,
  getMenuItems,
  getServices,
  getTestimonials,
} from "./data";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettingsData,
  type NavigationData,
} from "@/types/site";

async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getPublicSiteSettings(): Promise<SiteSettingsData> {
  const settings = await safeFetch(getSiteSettings, DEFAULT_SITE_SETTINGS);
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...settings,
    logos: {
      ...DEFAULT_SITE_SETTINGS.logos,
      ...settings.logos,
      main: settings.logos?.main || DEFAULT_SITE_SETTINGS.logos.main,
      footer: settings.logos?.footer || settings.logos?.main || DEFAULT_SITE_SETTINGS.logos.footer,
    },
    businessHours:
      settings.businessHours?.length > 0
        ? settings.businessHours
        : DEFAULT_SITE_SETTINGS.businessHours,
  };
}

export async function getPublicNavigation(): Promise<NavigationData> {
  return safeFetch(getNavigation, {
    links: [
      { label: "Home", href: "/", displayOrder: 0, isVisible: true, openInNewTab: false },
      { label: "About", href: "/about", displayOrder: 1, isVisible: true, openInNewTab: false },
      { label: "Menu", href: "/menu", displayOrder: 2, isVisible: true, openInNewTab: false },
      { label: "Services", href: "/services", displayOrder: 3, isVisible: true, openInNewTab: false },
      { label: "Booking", href: "/booking", displayOrder: 4, isVisible: true, openInNewTab: false },
      { label: "Contact", href: "/contact", displayOrder: 5, isVisible: true, openInNewTab: false },
    ],
  });
}

export {
  getPageContent,
  getMenuCategories,
  getMenuItems,
  getServices,
  getTestimonials,
};
