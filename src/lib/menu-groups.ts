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

const ARCHIVED_CATEGORY_SLUGS = new Set([
  "omelettes",
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

export function resolveMenuGroupFromPath(pathname: string): MenuGroupId {
  if (pathname.includes("lunch-and-dinner")) return "lunch-dinner";
  if (pathname.includes("/breakfast")) return "breakfast";
  return "breakfast";
}
