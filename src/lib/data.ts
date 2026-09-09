import { connectDB } from "./db";
import {
  SiteSettings,
  Navigation,
  PageContent,
  MenuCategory,
  MenuItem,
  Service,
  Testimonial,
  SeoSettings,
} from "@/models";
import type {
  SiteSettingsData,
  NavigationData,
  MenuCategoryData,
  MenuItemData,
  ServiceData,
  TestimonialData,
  PageSection,
} from "@/types/site";

export async function getSiteSettings(): Promise<SiteSettingsData> {
  await connectDB();
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return JSON.parse(JSON.stringify(settings));
}

export async function getNavigation(): Promise<NavigationData> {
  await connectDB();
  let nav = await Navigation.findOne();
  if (!nav) {
    nav = await Navigation.create({
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
  return JSON.parse(JSON.stringify(nav));
}

export async function getPageContent(slug: string): Promise<{
  pageSlug: string;
  pageTitle: string;
  sections: PageSection[];
} | null> {
  await connectDB();
  const page = await PageContent.findOne({ pageSlug: slug });
  return page ? JSON.parse(JSON.stringify(page)) : null;
}

export async function getMenuCategories(featuredOnly = false): Promise<MenuCategoryData[]> {
  await connectDB();
  const query: Record<string, unknown> = { isActive: true, isArchived: false };
  if (featuredOnly) query.isFeatured = true;
  const categories = await MenuCategory.find(query).sort({ displayOrder: 1 });
  return JSON.parse(JSON.stringify(categories));
}

export async function getMenuItems(filters?: {
  category?: string;
  featured?: boolean;
  popular?: boolean;
  search?: string;
}): Promise<MenuItemData[]> {
  await connectDB();
  const query: Record<string, unknown> = { isArchived: false };
  if (filters?.category) {
    const cat = await MenuCategory.findOne({ slug: filters.category });
    if (cat) query.category = cat._id;
  }
  if (filters?.featured) query.isFeatured = true;
  if (filters?.popular) query.isPopular = true;

  let items = await MenuItem.find(query)
    .populate("category")
    .sort({ displayOrder: 1 });

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
    );
  }

  return JSON.parse(JSON.stringify(items));
}

export async function getServices(featuredOnly = false): Promise<ServiceData[]> {
  await connectDB();
  const query: Record<string, unknown> = { isActive: true, isArchived: false };
  if (featuredOnly) query.isFeatured = true;
  const services = await Service.find(query).sort({ displayOrder: 1 });
  return JSON.parse(JSON.stringify(services));
}

export async function getTestimonials(approvedOnly = true, featuredOnly = false): Promise<TestimonialData[]> {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (approvedOnly) query.status = "approved";
  if (featuredOnly) query.isFeatured = true;
  const testimonials = await Testimonial.find(query).sort({ reviewDate: -1 });
  return JSON.parse(JSON.stringify(testimonials));
}

export async function getSeoSettings() {
  await connectDB();
  let seo = await SeoSettings.findOne();
  if (!seo) {
    seo = await SeoSettings.create({});
  }
  return JSON.parse(JSON.stringify(seo));
}

export async function getDashboardStats() {
  await connectDB();
  const [
    totalMenuItems,
    activeMenuItems,
    unavailableItems,
    newBookings,
    pendingBookings,
    newInquiries,
    pendingTestimonials,
  ] = await Promise.all([
    MenuItem.countDocuments({ isArchived: false }),
    MenuItem.countDocuments({ isArchived: false, isAvailable: true }),
    MenuItem.countDocuments({ isArchived: false, isAvailable: false }),
    (await import("@/models/BookingRequest")).default.countDocuments({ status: "new" }),
    (await import("@/models/BookingRequest")).default.countDocuments({ status: "pending" }),
    (await import("@/models/ContactInquiry")).default.countDocuments({ status: "new" }),
    Testimonial.countDocuments({ status: "pending" }),
  ]);

  return {
    totalMenuItems,
    activeMenuItems,
    unavailableItems,
    newBookings,
    pendingBookings,
    newInquiries,
    pendingTestimonials,
  };
}
