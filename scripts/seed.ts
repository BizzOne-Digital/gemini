import "./load-env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  AdminUser,
  SiteSettings,
  Navigation,
  PageContent,
  MenuCategory,
  Service,
  SeoSettings,
} from "../src/models";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@homestylediner.ca";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "Admin@Homestyle2024!";

  const existingAdmin = await AdminUser.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await AdminUser.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashed,
      role: "super_admin",
      isActive: true,
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log("Admin user already exists.");
  }

  const settingsCount = await SiteSettings.countDocuments();
  if (settingsCount === 0) {
    await SiteSettings.create({
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
      directionsUrl: "https://maps.google.com/?q=504+Albert+St+Waterloo+ON",
      businessHours: [
        { day: "Monday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
        { day: "Tuesday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
        { day: "Wednesday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
        { day: "Thursday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
        { day: "Friday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
        { day: "Saturday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
        { day: "Sunday", open: "9:00 AM", close: "7:00 PM", isClosed: false },
      ],
      facebookUrl: "https://www.facebook.com/Homestyledinerwaterloo/",
      footerDescription:
        "Family-owned and operated in Waterloo since 1987. Homemade comfort food, served with heart.",
      pricingDisclaimer: "Menu items, pricing, and availability are subject to change.",
      logos: {
        main: "/images/logo.png",
        footer: "/images/logo.png",
        favicon: "/favicon.png",
        altText: "Homestyle Diner",
      },
    });
    console.log("Site settings seeded.");
  }

  const navCount = await Navigation.countDocuments();
  if (navCount === 0) {
    await Navigation.create({
      links: [
        { label: "Home", href: "/", displayOrder: 0, isVisible: true, openInNewTab: false },
        { label: "About", href: "/about", displayOrder: 1, isVisible: true, openInNewTab: false },
        { label: "Menu", href: "/menu", displayOrder: 2, isVisible: true, openInNewTab: false },
        { label: "Services", href: "/services", displayOrder: 3, isVisible: true, openInNewTab: false },
        { label: "Booking", href: "/booking", displayOrder: 4, isVisible: true, openInNewTab: false },
        { label: "Contact", href: "/contact", displayOrder: 5, isVisible: true, openInNewTab: false },
      ],
      ctaCall: { label: "Call Now", href: "tel:5197255048", isVisible: true },
      ctaOrder: { label: "Order Online", href: "", isVisible: true, openInNewTab: true },
    });
    console.log("Navigation seeded.");
  }

  const categoryCount = await MenuCategory.countDocuments();
  if (categoryCount === 0) {
    const categories = [
      { name: "Breakfast", slug: "breakfast", description: "Start your day with hearty homemade breakfasts", displayOrder: 0, isFeatured: true },
      { name: "Lunch", slug: "lunch", description: "Satisfying midday meals made fresh", displayOrder: 1, isFeatured: true },
      { name: "Dinner", slug: "dinner", description: "Slow-cooked favourites for the evening", displayOrder: 2, isFeatured: true },
      { name: "Bakery & Desserts", slug: "bakery-desserts", description: "Fresh pies and made-from-scratch desserts", displayOrder: 3, isFeatured: true },
      { name: "Kids' Meals", slug: "kids", description: "Family-friendly portions for little ones", displayOrder: 4, isFeatured: true },
      { name: "Drinks", slug: "drinks", description: "Coffee, tea, and refreshing beverages", displayOrder: 5, isFeatured: true },
      { name: "Breakfast Mains", slug: "breakfast-mains", displayOrder: 10 },
      { name: "Omelettes", slug: "omelettes", displayOrder: 11 },
      { name: "Benedicts", slug: "benedicts", displayOrder: 12 },
      { name: "Pancakes & French Toast", slug: "pancakes-french-toast", displayOrder: 13 },
      { name: "Lighter Breakfasts", slug: "lighter-breakfasts", displayOrder: 14 },
      { name: "Starters", slug: "starters", displayOrder: 15 },
      { name: "Soups", slug: "soups", displayOrder: 16 },
      { name: "Salads", slug: "salads", displayOrder: 17 },
      { name: "Sandwiches", slug: "sandwiches", displayOrder: 18 },
      { name: "Grilled Cheese", slug: "grilled-cheese", displayOrder: 19 },
      { name: "Burgers", slug: "burgers", displayOrder: 20 },
      { name: "Wraps", slug: "wraps", displayOrder: 21 },
      { name: "Poutine", slug: "poutine", displayOrder: 22 },
      { name: "Classics", slug: "classics", displayOrder: 23 },
      { name: "Dinners", slug: "dinners", displayOrder: 24 },
      { name: "Schnitzels", slug: "schnitzels", displayOrder: 25 },
      { name: "Sides", slug: "sides", displayOrder: 26 },
      { name: "Pies", slug: "pies", displayOrder: 27 },
      { name: "Desserts", slug: "desserts", displayOrder: 28 },
    ];
    await MenuCategory.insertMany(categories);
    console.log("Menu categories seeded.");
  }

  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    const services = [
      { title: "Breakfast", slug: "breakfast", shortDescription: "Hearty morning meals to start your day right", fullDescription: "From classic eggs and bacon to fluffy pancakes and omelettes, our breakfast menu features homemade favourites prepared fresh every morning.", ctaLabel: "View Breakfast Menu", ctaHref: "/menu?category=breakfast", displayOrder: 0, isFeatured: true },
      { title: "Lunch", slug: "lunch", shortDescription: "Perfect midday meals for teams and families", fullDescription: "Satisfying sandwiches, burgers, soups, and daily specials — ideal for a quick lunch break or a relaxed midday meal.", ctaLabel: "View Lunch Menu", ctaHref: "/menu?category=lunch", displayOrder: 1, isFeatured: true },
      { title: "Dinner", slug: "dinner", shortDescription: "Slow-cooked comfort food classics", fullDescription: "Enjoy our dinner favourites including schnitzels, roast turkey, and homestyle classics prepared with recipes passed down through generations.", ctaLabel: "View Dinner Menu", ctaHref: "/menu?category=dinner", displayOrder: 2, isFeatured: true },
      { title: "Bakery & Desserts", slug: "bakery", shortDescription: "Fresh pies and made-from-scratch desserts", fullDescription: "Our bakery features homemade pies, cakes, and desserts baked fresh using traditional family recipes.", image: "/images/Photos/WhatsApp%20Image%202026-09-11%20at%2012.11.36%20PM.jpeg", imageAlt: "Homemade pie and bakery desserts at Homestyle Diner", ctaLabel: "View Desserts", ctaHref: "/menu?category=desserts", displayOrder: 3, isFeatured: true },
      { title: "Dine-In", slug: "dine-in", shortDescription: "A welcoming atmosphere for all ages", fullDescription: "Join us in our cozy, family-friendly dining room. Whether it's a quick breakfast or a leisurely dinner, you'll feel right at home.", ctaLabel: "Book a Table", ctaHref: "/booking", displayOrder: 4 },
      { title: "Takeout", slug: "takeout", shortDescription: "Homemade meals to enjoy at home", fullDescription: "Call ahead or order online for convenient takeout of your favourite homestyle dishes.", ctaLabel: "Order Online", ctaHref: "/contact", displayOrder: 5 },
      { title: "Catering", slug: "catering", shortDescription: "Homemade food for your next event", fullDescription: "Let us cater your office meeting, family gathering, or special celebration with our homestyle menu options.", image: "/images/Photos/WhatsApp%20Image%202026-09-13%20at%2012.42.08%20PM.jpeg", imageAlt: "Catering sandwich and wrap platters", ctaLabel: "Request Catering", ctaHref: "/booking?type=catering", displayOrder: 6, isFeatured: true },
      { title: "Group Dining", slug: "group-dining", shortDescription: "Perfect for teams, families, and celebrations", fullDescription: "Planning a group meal? We welcome parties and can accommodate your group with advance notice.", image: "/images/Photos/1%20(4).JPEG", imageAlt: "Group dining at Homestyle Diner Waterloo", ctaLabel: "Book Group Dining", ctaHref: "/booking?type=group_dining", displayOrder: 7 },
    ];
    await Service.insertMany(services);
    console.log("Services seeded.");
  }

  const pageCount = await PageContent.countDocuments();
  if (pageCount === 0) {
    await PageContent.insertMany([
      {
        pageSlug: "home",
        pageTitle: "Home",
        sections: [
          { key: "hero", eyebrow: "Family Owned in Waterloo Since 1987", heading: "Homemade Comfort Food, Served with Heart.", description: "From hearty breakfasts and lunches to slow-cooked dinners, homestyle favourites, and freshly baked pies, enjoy the flavours of home in the heart of Waterloo.", image: "/images/Photos/WhatsApp%20Image%202026-09-11%20at%2012.10.31%20PM.jpeg", imageAlt: "Fish and chips at Homestyle Diner", ctaLabel: "See What's Cooking", ctaHref: "/menu", ctaSecondaryLabel: "Book a Table", ctaSecondaryHref: "/booking", isVisible: true, displayOrder: 0 },
          { key: "welcome", heading: "A Waterloo Tradition Since 1987", description: "Homestyle Diner is a family-owned and operated restaurant in Waterloo, Ontario, serving the community since 1987. The restaurant specializes in homemade comfort food prepared with recipes passed down through generations.", image: "/images/Photos/1%20(4).JPEG", imageAlt: "Homestyle Diner interior with daily specials board", ctaLabel: "Discover Our Story", ctaHref: "/about", isVisible: true, displayOrder: 1 },
          { key: "difference", heading: "The Homemade Difference", isVisible: true, displayOrder: 2 },
          { key: "audience", heading: "Made for Everyone", isVisible: true, displayOrder: 3 },
          { key: "bakery", heading: "Fresh From Our Bakery", description: "Homemade pies and made-from-scratch desserts baked daily using traditional family recipes.", image: "/images/Photos/WhatsApp%20Image%202026-09-11%20at%2012.11.36%20PM.jpeg", imageAlt: "Homemade pie from Homestyle Diner bakery", ctaLabel: "View Desserts", ctaHref: "/menu?category=desserts", isVisible: true, displayOrder: 4 },
          { key: "final-cta", heading: "Come Hungry. Leave Feeling at Home.", ctaLabel: "View Menu", ctaHref: "/menu", ctaSecondaryLabel: "Call Us", ctaSecondaryHref: "tel:5197255048", isVisible: true, displayOrder: 5 },
        ],
      },
      {
        pageSlug: "about",
        pageTitle: "About Us",
        sections: [
          { key: "hero", heading: "Our Story", description: "Family-owned and operated in Waterloo since 1987.", isVisible: true, displayOrder: 0 },
          { key: "story", heading: "Generations of Homemade Goodness", description: "Homestyle Diner takes pride in serving fresh, homemade meals and made-from-scratch desserts in a welcoming, family-friendly atmosphere.", isVisible: true, displayOrder: 1 },
        ],
      },
    ]);
    console.log("Page content seeded.");
  }

  const seoCount = await SeoSettings.countDocuments();
  if (seoCount === 0) {
    await SeoSettings.create({
      defaultTitle: "Homestyle Diner | Homemade Comfort Food in Waterloo, ON",
      defaultDescription: "Family-owned diner in Waterloo since 1987. Hearty breakfasts, slow-cooked favourites, and freshly baked pies. Dine-in, takeout, catering, and group dining.",
      pages: [
        { path: "/", title: "Homestyle Diner | Homemade Comfort Food in Waterloo, ON", description: "Family-owned diner in Waterloo since 1987." },
        { path: "/about", title: "About Us | Homestyle Diner Waterloo", description: "Learn about our family-owned restaurant serving Waterloo since 1987." },
        { path: "/menu", title: "Menu | Homestyle Diner Waterloo", description: "Browse our full menu of homemade comfort food." },
        { path: "/contact", title: "Contact Us | Homestyle Diner Waterloo", description: "Get in touch with Homestyle Diner in Waterloo." },
        { path: "/booking", title: "Book a Table | Homestyle Diner Waterloo", description: "Request a table, group dining, or catering." },
      ],
    });
    console.log("SEO settings seeded.");
  }

  console.log("\nSeed completed successfully!");
  console.log(`Database: ${MONGODB_URI}`);
  console.log(`Admin login: ${adminEmail}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
