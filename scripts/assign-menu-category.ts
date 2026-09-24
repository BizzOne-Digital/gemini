type CatalogSection =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Desserts"
  | "Drinks"
  | "Uncategorized";

export type CatalogLike = {
  name: string;
  section: CatalogSection;
  description?: string;
};

const SIDE_ITEMS = new Set(
  [
    "Bacon slices (5)",
    "Ham Slices (2)",
    "Egg (1)",
    "Homefries",
    "Hollandaise Sauce",
    "Oktoberfest Sausage (1)",
    "Peameal Slices (4)",
    "Sausage Links (4)",
    "Single French Toast",
    "Single Pancake",
    "Toast (1)",
    "Tomatoes",
    "Turkey Sausage (4)",
  ].map((n) => n.toLowerCase())
);

const BREAKFAST_OLE = [
  "ole albert",
  "ole hazel",
  "homestyle favourite",
  "2 eggs, homefries or pancakes, and toast",
  "homstyle sandwich",
  "parkdale sandwich",
];

export function assignMenuCategorySlug(item: CatalogLike): string {
  const name = item.name.trim();
  const lower = name.toLowerCase();
  const section = item.section;

  if (section === "Uncategorized") {
    if (lower.includes("denver western wrap")) return "sandwiches-wraps";
    if (lower.includes("fresh fruit cup")) return "lighter-side";
    return "homestyle-specials";
  }

  if (section === "Desserts") return "bakery-desserts";

  if (section === "Drinks") {
    if (/wine/i.test(name)) return "wine";
    if (/beer/i.test(name)) return "beer";
    if (/cocktail|liquor|whiskey|vodka|rum|gin/i.test(name)) {
      return "liquor-cocktails";
    }
    return "beverages";
  }

  if (section === "Breakfast") {
    if (SIDE_ITEMS.has(lower)) return "on-the-side";
    if (BREAKFAST_OLE.some((k) => lower.includes(k))) return "ole-faithfuls";
    if (/benedict/i.test(name)) return "benedicts";
    if (/omelette/i.test(name)) return "ole-faithfuls";
    if (/pancake|waffle/i.test(name)) return "pancakes-waffles";
    if (/french toast/i.test(name)) return "french-toast";
    if (/wrap|sandwich|blt|bec|griller/i.test(name)) return "sandwiches-wraps";
    if (/fruit|light and lively/i.test(name)) return "lighter-side";
    return "ole-faithfuls";
  }

  if (section === "Lunch" || section === "Dinner") {
    if (/kid/i.test(name)) return "kids-menu";
    if (/poutine/i.test(name)) return "poutine";
    if (/schnitzel/i.test(name)) return "schnitzels";
    if (/burger|on a bun|between/i.test(name)) return "between-the-bun";
    if (/wrap|sandwich|club|griller|toast/i.test(name)) return "sandwiches-wraps";
    if (/salad/i.test(name)) return "salads";
    if (/soup|starter|onion ring|pickle/i.test(name)) return "starters";
    if (/rolled rib/i.test(name)) return "homestyle-signature";
    if (/roast|turkey|meatloaf|fish|chicken|beef|ham dinner|classic/i.test(name)) {
      return "classics";
    }
    if (/pie|cake|brownie|cheesecake|dessert|bakery/i.test(name)) {
      return "bakery-desserts";
    }
    return "classics";
  }

  return "homestyle-specials";
}
