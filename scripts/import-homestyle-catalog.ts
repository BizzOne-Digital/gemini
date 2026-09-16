import "./load-env";
import { readFileSync } from "fs";
import { join } from "path";
import mongoose from "mongoose";
import { MenuCategory, MenuItem } from "../src/models";
import { normalizeItemName, slugify } from "../src/lib/utils";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";

type CatalogSection =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Desserts"
  | "Drinks"
  | "Uncategorized";

type CatalogItem = {
  name: string;
  price: number;
  description: string;
  section: CatalogSection;
  websiteCategories: string;
};

const CATEGORIES: { name: CatalogSection; slug: string; displayOrder: number }[] = [
  { name: "Breakfast", slug: "breakfast", displayOrder: 0 },
  { name: "Lunch", slug: "lunch", displayOrder: 1 },
  { name: "Dinner", slug: "dinner", displayOrder: 2 },
  { name: "Desserts", slug: "desserts", displayOrder: 3 },
  { name: "Drinks", slug: "drinks", displayOrder: 4 },
  { name: "Uncategorized", slug: "uncategorized", displayOrder: 5 },
];

const SECTION_SLUG: Record<CatalogSection, string> = {
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
  Desserts: "desserts",
  Drinks: "drinks",
  Uncategorized: "uncategorized",
};

function baseItemSlug(name: string, section: CatalogSection, price: number): string {
  const priceCents = Math.round(price * 100);
  return `${slugify(name)}-${SECTION_SLUG[section]}-${priceCents}`;
}

function uniqueItemSlug(
  name: string,
  section: CatalogSection,
  price: number,
  description: string,
  used: Set<string>
): string {
  let slug = baseItemSlug(name, section, price);
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }
  const suffix = slugify(description).slice(0, 48) || "variant";
  slug = `${baseItemSlug(name, section, price)}-${suffix}`;
  if (used.has(slug)) {
    let n = 2;
    while (used.has(`${slug}-${n}`)) n++;
    slug = `${slug}-${n}`;
  }
  used.add(slug);
  return slug;
}

async function ensureCategories() {
  const bySlug = new Map<string, mongoose.Types.ObjectId>();

  for (const cat of CATEGORIES) {
    const doc = await MenuCategory.findOneAndUpdate(
      { slug: cat.slug },
      {
        $set: {
          name: cat.name,
          slug: cat.slug,
          displayOrder: cat.displayOrder,
          isActive: true,
          isArchived: false,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    bySlug.set(cat.slug, doc!._id);
  }

  return bySlug;
}

async function importCatalog() {
  const catalogPath = join(process.cwd(), "data", "homestyle-menu.json");
  const raw = readFileSync(catalogPath, "utf8");
  const items = JSON.parse(raw) as CatalogItem[];

  if (!Array.isArray(items) || items.length !== 145) {
    throw new Error(`Expected 145 catalog items, got ${Array.isArray(items) ? items.length : "invalid JSON"}`);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const categoryIds = await ensureCategories();
  console.log("Categories ensured.");

  let upserted = 0;
  const usedSlugs = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const sectionSlug = SECTION_SLUG[item.section];
    const categoryId = categoryIds.get(sectionSlug);
    if (!categoryId) {
      throw new Error(`Unknown section: ${item.section}`);
    }

    const slug = uniqueItemSlug(
      item.name,
      item.section,
      item.price,
      item.description,
      usedSlugs
    );
    const description = item.description?.trim() ? item.description.trim() : undefined;

    await MenuItem.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: item.name,
          slug,
          normalizedName: normalizeItemName(item.name),
          description,
          price: item.price,
          currency: "CAD",
          category: categoryId,
          subcategory: item.websiteCategories,
          dietaryTags: [],
          allergens: [],
          variants: [],
          addOns: [],
          isAvailable: true,
          isFeatured: false,
          isPopular: false,
          displayOrder: i,
          isArchived: false,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    upserted++;
  }

  const archived = await MenuItem.updateMany(
    { slug: { $nin: [...usedSlugs] }, isArchived: { $ne: true } },
    { $set: { isArchived: true } }
  );
  console.log(`Archived ${archived.modifiedCount} legacy menu items not in catalog.`);

  console.log(`Upserted ${upserted} menu items.`);
  await mongoose.disconnect();
  console.log("Done.");
}

importCatalog().catch((err) => {
  console.error(err);
  process.exit(1);
});
