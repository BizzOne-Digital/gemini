import "./load-env";
import { readFileSync } from "fs";
import { join } from "path";
import mongoose from "mongoose";
import { MenuCategory, MenuItem, SiteSettings, Testimonial } from "../src/models";
import { MENU_GROUPS } from "../src/lib/menu-groups";
import { assignMenuCategorySlug } from "./assign-menu-category";
import { normalizeItemName } from "../src/lib/utils";
import { SITE_PHOTOS } from "../src/lib/site-photos";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";

const CATEGORY_DEFS: { name: string; slug: string; displayOrder: number }[] = [
  { name: "Ole Faithfuls", slug: "ole-faithfuls", displayOrder: 1 },
  { name: "Benedicts", slug: "benedicts", displayOrder: 2 },
  { name: "Pancakes & Waffles", slug: "pancakes-waffles", displayOrder: 3 },
  { name: "Sandwiches & Wraps", slug: "sandwiches-wraps", displayOrder: 4 },
  { name: "French Toast", slug: "french-toast", displayOrder: 5 },
  { name: "Lighter Side", slug: "lighter-side", displayOrder: 6 },
  { name: "On the Side", slug: "on-the-side", displayOrder: 7 },
  { name: "Starters", slug: "starters", displayOrder: 10 },
  { name: "Salads", slug: "salads", displayOrder: 11 },
  { name: "Classics", slug: "classics", displayOrder: 12 },
  { name: "Homestyle Signature", slug: "homestyle-signature", displayOrder: 13 },
  { name: "Schnitzels", slug: "schnitzels", displayOrder: 14 },
  { name: "Between the Bun", slug: "between-the-bun", displayOrder: 15 },
  { name: "Poutine", slug: "poutine", displayOrder: 16 },
  { name: "Kids Menu", slug: "kids-menu", displayOrder: 17 },
  { name: "Bakery & Desserts", slug: "bakery-desserts", displayOrder: 20 },
  { name: "Beverages", slug: "beverages", displayOrder: 30 },
  { name: "Wine", slug: "wine", displayOrder: 31 },
  { name: "Beer", slug: "beer", displayOrder: 32 },
  { name: "Liquor & Cocktails", slug: "liquor-cocktails", displayOrder: 33 },
  { name: "Homestyle Specials", slug: "homestyle-specials", displayOrder: 40 },
];

const ARCHIVE_SLUGS = [
  "omelettes",
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
        instagramUrl: "https://www.instagram.com/homestyledinerwaterloo/",
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
  await seedGoogleReviews();
  await patchSettings();

  await mongoose.disconnect();
  console.log("Rev 2 menu/content sync complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
