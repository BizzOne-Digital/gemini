import "./load-env";
import { readFileSync } from "fs";
import { join } from "path";
import mongoose from "mongoose";
import { MenuCategory, MenuItem, SiteSettings, Testimonial } from "../src/models";
import { MENU_GROUPS } from "../src/lib/menu-groups";
import { MENU_CATEGORY_DEFS } from "../src/lib/menu-category-defs";
import { assignMenuCategorySlug } from "./assign-menu-category";
import { normalizeItemName } from "../src/lib/utils";
import { SITE_PHOTOS } from "../src/lib/site-photos";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";

const CATEGORY_DEFS = MENU_CATEGORY_DEFS;

const ARCHIVE_SLUGS = [
  "breakfast-mains",
  "kids-meals",
  "kids",
  "desserts",
  "breakfast",
  "lunch",
  "dinner",
  "uncategorized",
  "dinners",
  "pies",
  "soups",
  "grilled-cheese",
  "burgers",
  "wraps",
  "sandwiches",
  "lighter-breakfasts",
  "pancakes-french-toast",
  "sides",
];

async function ensureCategories() {
  const ids = new Map<string, mongoose.Types.ObjectId>();

  for (const def of CATEGORY_DEFS) {
    const doc = await MenuCategory.findOneAndUpdate(
      { slug: def.slug },
      {
        $set: {
          name: def.name,
          slug: def.slug,
          displayOrder: def.displayOrder,
          isActive: true,
          isFeatured: true,
          isArchived: false,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    ids.set(def.slug, doc!._id);
  }

  await MenuCategory.updateMany(
    { slug: { $in: ARCHIVE_SLUGS } },
    { $set: { isArchived: true, isActive: false } }
  );

  return ids;
}

async function reassignItems(categoryIds: Map<string, mongoose.Types.ObjectId>) {
  const catalogPath = join(process.cwd(), "data", "homestyle-menu.json");
  const items = JSON.parse(readFileSync(catalogPath, "utf8")) as {
    name: string;
    section: string;
    description: string;
  }[];

  let updated = 0;
  for (const row of items) {
    const slug = assignMenuCategorySlug(
      row as Parameters<typeof assignMenuCategorySlug>[0]
    );
    const categoryId = categoryIds.get(slug);
    if (!categoryId) continue;

    const isRibs = /rolled rib/i.test(row.name);
    const patch: Record<string, unknown> = { category: categoryId };
    if (isRibs) {
      patch.name = "Rolled Ribs (35 Year Favourite)";
      patch.description = row.description?.trim();
      patch.isFeatured = true;
      patch.image = SITE_PHOTOS.rolledRibs;
    }

    const result = await MenuItem.updateMany(
      { normalizedName: normalizeItemName(row.name) },
      { $set: patch }
    );
    updated += result.modifiedCount;
  }

  console.log(`Reassigned ${updated} menu item documents.`);
}

async function seedGoogleReviews() {
  const reviews = [
    {
      customerName: "Sarah M.",
      rating: 5,
      reviewText:
        "Best breakfast in Waterloo! Generous portions, homemade flavour, and friendly staff every time.",
      source: "google",
      status: "approved" as const,
      isFeatured: true,
    },
    {
      customerName: "James T.",
      rating: 5,
      reviewText:
        "Our go-to lunch spot — soups, sandwiches, and service are always excellent.",
      source: "google",
      status: "approved" as const,
      isFeatured: true,
    },
    {
      customerName: "Priya K.",
      rating: 5,
      reviewText:
        "Bakery treats are amazing and Friday rolled ribs are a must-try. Five stars!",
      source: "google",
      status: "approved" as const,
      isFeatured: true,
    },
  ];

  for (const r of reviews) {
    await Testimonial.findOneAndUpdate(
      { customerName: r.customerName, source: "google", reviewText: r.reviewText },
      { $set: r },
      { upsert: true }
    );
  }
  console.log("Google review testimonials ensured.");
}

async function patchSettings() {
  await SiteSettings.findOneAndUpdate(
    {},
    {
      $set: {
        instagramUrl: "https://www.instagram.com/homestyle.diner/?hl=en",
        onlineOrderingEnabled: true,
        shopEnabled: true,
        deliveryEnabled: false,
        notificationEmail: "homestylewaterloo@gmail.com",
      },
    },
    { upsert: true }
  );
  console.log("Site settings updated (Instagram URL).");
}

async function main() {
  console.log("Connecting…");
  await mongoose.connect(MONGODB_URI);

  const ids = await ensureCategories();
  console.log(`Menu groups: ${MENU_GROUPS.map((g) => g.label).join(", ")}`);

  await reassignItems(ids);
  await MenuItem.updateMany(
    { isArchived: false, isAvailable: true },
    { $set: { isOnlineOrderable: true } }
  );
  console.log("Menu items marked available for online ordering.");
  await seedGoogleReviews();
  await patchSettings();

  await mongoose.disconnect();
  console.log("Rev 2 menu/content sync complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
