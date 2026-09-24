import type { MenuCategoryData } from "@/types/site";
import { SITE_PHOTOS } from "@/lib/site-photos";

/** Homepage “Browse by Craving” cards — image + slug order. */
export const HOME_MENU_CATEGORY_CARDS = [
  {
    slug: "breakfast",
    name: "Breakfast",
    image: SITE_PHOTOS.breakfastBenedict,
    imageAlt: "Eggs Benedict breakfast at Homestyle Diner",
  },
  {
    slug: "lunch",
    name: "Lunch",
    image: SITE_PHOTOS.lunchBurger,
    imageAlt: "Bacon cheeseburger with fries",
  },
  {
    slug: "dinner",
    name: "Dinner",
    image: "/images/categories/dinner.jpg",
    imageAlt: "Homestyle dinner plate with roasted meat and potatoes",
  },
  {
    slug: "bakery-desserts",
    name: "Bakery & Desserts",
    image: "/images/categories/bakery-desserts.jpg",
    imageAlt: "Strawberry pie and brownie sundae",
  },
  {
    slug: "kids-menu",
    name: "Kids' Meals",
    image: "/images/categories/kids.jpg",
    imageAlt: "Pancakes with berries for kids",
  },
  {
    slug: "drinks",
    name: "Drinks",
    image: "/images/categories/drinks.jpg",
    imageAlt: "Fresh coffee at Homestyle Diner",
  },
] as const;

const SLUG_ALIASES: Record<string, string[]> = {
  "bakery-desserts": ["bakery-desserts", "bakery", "desserts"],
  "kids-menu": ["kids-menu", "kids-meals", "kids"],
};

export type HomeMenuCategoryCard = {
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  description?: string;
  startingPrice?: number;
  menuSlug: string;
};

function findDbCategory(
  card: (typeof HOME_MENU_CATEGORY_CARDS)[number],
  categories: MenuCategoryData[]
): MenuCategoryData | undefined {
  const slugs = [card.slug, ...(SLUG_ALIASES[card.slug] ?? [])];
  return categories.find((c) => slugs.includes(c.slug));
}

export function resolveHomeMenuCategories(
  categories: MenuCategoryData[]
): HomeMenuCategoryCard[] {
  return HOME_MENU_CATEGORY_CARDS.map((card) => {
    const db = findDbCategory(card, categories);
    return {
      ...card,
      name: db?.name === "Desserts" ? card.name : db?.name ?? card.name,
      description: db?.description,
      startingPrice: db?.startingPrice,
      menuSlug: db?.slug ?? card.slug,
    };
  });
}
