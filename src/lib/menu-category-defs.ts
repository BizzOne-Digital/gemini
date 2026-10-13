/** Rev 2 menu categories — shared by import/reorganize scripts and admin. */
export const MENU_CATEGORY_DEFS: {
  name: string;
  slug: string;
  displayOrder: number;
}[] = [
  { name: "Ole Faithfuls", slug: "ole-faithfuls", displayOrder: 1 },
  { name: "Omelettes", slug: "omelettes", displayOrder: 2 },
  { name: "Benedicts", slug: "benedicts", displayOrder: 3 },
  { name: "Pancakes & Waffles", slug: "pancakes-waffles", displayOrder: 4 },
  { name: "Sandwiches & Wraps", slug: "sandwiches-wraps", displayOrder: 5 },
  { name: "French Toast", slug: "french-toast", displayOrder: 6 },
  { name: "Lighter Side", slug: "lighter-side", displayOrder: 7 },
  { name: "On the Side", slug: "on-the-side", displayOrder: 8 },
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

export const LEGACY_MENU_CATEGORY_SLUGS = [
  "breakfast",
  "lunch",
  "dinner",
  "desserts",
  "drinks",
  "uncategorized",
  "omelettes",
  "breakfast-mains",
  "kids-meals",
  "kids",
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
] as const;
