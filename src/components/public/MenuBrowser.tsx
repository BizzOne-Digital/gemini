"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Leaf, Wheat, Flame } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { resolveImageSrc } from "@/lib/resolve-image";
import type { MenuCategoryData, MenuItemData } from "@/types/site";
import { Card } from "@/components/ui/Card";

const DIETARY_FILTERS = [
  { id: "vegetarian", label: "Vegetarian", icon: Leaf },
  { id: "gluten-free", label: "Gluten-Free", icon: Wheat },
  { id: "spicy", label: "Spicy", icon: Flame },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";

interface MenuBrowserProps {
  categories: MenuCategoryData[];
  items: MenuItemData[];
}

function getCategoryName(
  item: MenuItemData
): string {
  if (typeof item.category === "object" && item.category?.name) {
    return item.category.name;
  }
  return "";
}

function getCategorySlug(item: MenuItemData): string {
  if (typeof item.category === "object" && item.category?.slug) {
    return item.category.slug;
  }
  return "";
}

export function MenuBrowser({ categories, items }: MenuBrowserProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.isAvailable) return false;

      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "all" || getCategorySlug(item) === activeCategory;

      const matchesDietary =
        dietaryFilters.length === 0 ||
        dietaryFilters.every((f) =>
          item.dietaryTags?.some((t) => t.toLowerCase().includes(f))
        );

      return matchesSearch && matchesCategory && matchesDietary;
    });
  }, [items, search, activeCategory, dietaryFilters]);

  function toggleDietary(id: string) {
    setDietaryFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  return (
    <div className="w-full min-w-0 space-y-8">
      <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative w-full min-w-0 max-w-md flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-sm shadow-sm focus:border-fresh-leaf focus:outline-none focus:ring-2 focus:ring-fresh-leaf/20"
            aria-label="Search menu"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {DIETARY_FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleDietary(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                dietaryFilters.includes(id)
                  ? "border-heritage-green bg-heritage-green text-warm-cream"
                  : "border-border bg-white text-muted-foreground hover:border-fresh-leaf"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
          <div className="flex w-max max-w-full gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 active:scale-95",
                activeCategory === "all"
                  ? "gradient-green text-warm-cream shadow-soft"
                  : "bg-soft-oat text-espresso hover:bg-soft-oat/80"
              )}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 active:scale-95",
                  activeCategory === cat.slug
                    ? "gradient-green text-warm-cream shadow-soft"
                    : "bg-soft-oat text-espresso hover:bg-soft-oat/80"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl bg-soft-oat/50 py-16 text-center">
          <p className="font-display text-xl text-espresso">No items found</p>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters, or visit us to see today&apos;s
            specials.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item._id} hover padding="none" className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-soft-oat">
                <Image
                  src={resolveImageSrc(item.image, FALLBACK_IMAGE)}
                  alt={item.imageAlt || item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {item.isPopular && (
                  <span className="absolute left-3 top-3 rounded-full bg-butter-gold px-2.5 py-1 text-xs font-semibold text-espresso">
                    Popular
                  </span>
                )}
                {!item.isAvailable && (
                  <span className="absolute inset-0 flex items-center justify-center bg-charcoal/50 text-sm font-semibold text-warm-cream">
                    Unavailable
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg text-espresso">
                      {item.name}
                    </h3>
                    {getCategoryName(item) && (
                      <p className="text-xs text-fresh-leaf">
                        {getCategoryName(item)}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 font-semibold text-heritage-green">
                    {formatPrice(item.salePrice ?? item.price, item.currency)}
                  </p>
                </div>
                {item.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.dietaryTags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.dietaryTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-soft-oat px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-espresso"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
