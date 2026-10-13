/** Public menu navigation — matches homestylediner.ca structure (Rev 2). */
export type MenuGroupId =
  | "breakfast"
  | "lunch-dinner"
  | "bakery-desserts"
  | "drinks"
  | "specials";

export type MenuGroupConfig = {
  id: MenuGroupId;
  label: string;
  path: string;
  /** Category slugs shown as sub-tabs (in order). */
  categorySlugs: string[];
};

export const MENU_GROUPS: MenuGroupConfig[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    path: "/menu/breakfast",
    categorySlugs: [
      "ole-faithfuls",
      "omelettes",
      "benedicts",
      "pancakes-waffles",
      "sandwiches-wraps",
      "french-toast",
      "lighter-side",
      "on-the-side",
    ],
  },
  {
    id: "lunch-dinner",
    label: "Lunch & Dinner",
    path: "/menu/lunch-and-dinner",
    categorySlugs: [
      "starters",
      "salads",
      "sandwiches-wraps",
      "classics",
      "homestyle-signature",
      "schnitzels",
      "between-the-bun",
      "poutine",
      "on-the-side",
      "kids-menu",
    ],
  },
  {
    id: "bakery-desserts",
    label: "Bakery & Desserts",
    path: "/menu",
    categorySlugs: ["bakery-desserts"],
  },
  {
    id: "drinks",
    label: "Drinks",
    path: "/menu",
    categorySlugs: ["beverages", "wine", "beer", "liquor-cocktails"],
  },
  {
    id: "specials",
    label: "Homestyle Specials",
    path: "/menu",
    categorySlugs: ["homestyle-specials"],
  },
];

/** Legacy Square/import slugs → Rev 2 slug for menu browsing. */
const LEGACY_SLUG_MAP: Record<string, string> = {
  breakfast: "ole-faithfuls",
  "lighter-breakfasts": "lighter-side",
  "pancakes-french-toast": "pancakes-waffles",
  sides: "on-the-side",
  lunch: "classics",
  dinner: "classics",
  dinners: "classics",
  desserts: "bakery-desserts",
  pies: "bakery-desserts",
  drinks: "beverages",
  soups: "starters",
  "grilled-cheese": "classics",
  burgers: "between-the-bun",
  wraps: "sandwiches-wraps",
  sandwiches: "sandwiches-wraps",
  uncategorized: "homestyle-specials",
  "breakfast-mains": "ole-faithfuls",
  "kids-meals": "kids-menu",
  kids: "kids-menu",
};

const ARCHIVED_CATEGORY_SLUGS = new Set([
  "breakfast-mains",
  "kids-meals",
  "kids",
  "desserts",
  "dinner",
  "lunch",
  "breakfast",
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
]);

export function getMenuGroup(id: MenuGroupId): MenuGroupConfig | undefined {
  return MENU_GROUPS.find((g) => g.id === id);
}

export function groupForCategorySlug(slug: string): MenuGroupId | undefined {
  for (const group of MENU_GROUPS) {
    if (group.categorySlugs.includes(slug)) return group.id;
  }
  return undefined;
}

export function isArchivedMenuCategory(slug: string): boolean {
  return ARCHIVED_CATEGORY_SLUGS.has(slug);
}

/** Map stored category slug to the Rev 2 slug used for tabs and grouping. */
export function resolveMenuCategorySlug(slug: string): string {
  if (!slug) return slug;
  return LEGACY_SLUG_MAP[slug] ?? slug;
}

export function itemBelongsToMenuGroup(
  categorySlug: string,
  group: MenuGroupConfig
): boolean {
  const resolved = resolveMenuCategorySlug(categorySlug);
  if (group.categorySlugs.includes(resolved)) return true;
  if (
    group.id === "lunch-dinner" &&
    ["lunch", "dinner"].includes(categorySlug)
  ) {
    return true;
  }
  return false;
}

export function resolveMenuGroupFromPath(pathname: string): MenuGroupId {
  if (pathname.includes("lunch-and-dinner")) return "lunch-dinner";
  if (pathname.includes("/breakfast")) return "breakfast";
  return "breakfast";
}
