"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Leaf, Wheat, Flame } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { MenuCategoryData, MenuItemData } from "@/types/site";
import {
  MENU_GROUPS,
  type MenuGroupId,
  getMenuGroup,
  isArchivedMenuCategory,
} from "@/lib/menu-groups";
import { Card } from "@/components/ui/Card";

const DIETARY_FILTERS = [
  { id: "vegetarian", label: "Vegetarian", icon: Leaf },
  { id: "gluten-free", label: "Gluten-Free", icon: Wheat },
  { id: "spicy", label: "Spicy", icon: Flame },
];

interface MenuBrowserProps {
  categories: MenuCategoryData[];
  items: MenuItemData[];
  initialGroup?: MenuGroupId;
  initialCategory?: string;
}

function getCategoryName(item: MenuItemData): string {
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

function categoryLabel(slug: string, categories: MenuCategoryData[]): string {
  const cat = categories.find((c) => c.slug === slug);
  if (cat?.name) return cat.name;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function MenuBrowser({
  categories,
  items,
  initialGroup = "breakfast",
  initialCategory,
}: MenuBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const groupParam = searchParams.get("group") as MenuGroupId | null;
  const activeGroup =
    groupParam && getMenuGroup(groupParam) ? groupParam : initialGroup;

  const groupConfig = getMenuGroup(activeGroup) ?? MENU_GROUPS[0];

  const categoryParam =
    searchParams.get("category") || initialCategory || "";
  const activeCategory =
    categoryParam && groupConfig.categorySlugs.includes(categoryParam)
      ? categoryParam
      : "";

  const [search, setSearch] = useState("");
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const visibleCategories = useMemo(
    () =>
      categories.filter((c) => !isArchivedMenuCategory(c.slug)),
    [categories]
  );

  const subTabs = useMemo(() => {
    const slugs = groupConfig.categorySlugs;
    return slugs.filter((slug) =>
      items.some(
        (item) =>
          item.isAvailable && getCategorySlug(item) === slug
      )
    );
  }, [groupConfig.categorySlugs, items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.isAvailable) return false;

      const slug = getCategorySlug(item);
      const inGroup =
        groupConfig.categorySlugs.includes(slug) ||
        (activeGroup === "lunch-dinner" &&
          ["lunch", "dinner"].includes(slug));

      if (!inGroup) return false;

      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        !activeCategory || slug === activeCategory;

      const matchesDietary =
        dietaryFilters.length === 0 ||
        dietaryFilters.every((f) =>
          item.dietaryTags?.some((t) => t.toLowerCase().includes(f))
        );

      return matchesSearch && matchesCategory && matchesDietary;
    });
  }, [
    items,
    search,
    activeCategory,
    dietaryFilters,
    groupConfig.categorySlugs,
    activeGroup,
  ]);

  function toggleDietary(id: string) {
    setDietaryFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  function selectGroup(id: MenuGroupId) {
    updateQuery({ group: id, category: null });
  }

  function selectCategory(slug: string) {
    updateQuery({ category: slug || null });
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

      <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
        <div className="flex w-max max-w-full gap-2">
          {MENU_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => selectGroup(group.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 active:scale-95",
                activeGroup === group.id
                  ? "gradient-green text-warm-cream shadow-soft"
                  : "bg-soft-oat text-espresso hover:bg-soft-oat/80"
              )}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {subTabs.length > 0 && (
        <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
          <div className="flex w-max max-w-full gap-2">
            <button
              type="button"
              onClick={() => selectCategory("")}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                !activeCategory
                  ? "border-heritage-green bg-heritage-green/10 text-heritage-green"
                  : "border-border bg-white text-muted-foreground hover:border-fresh-leaf"
              )}
            >
              All {groupConfig.label}
            </button>
            {subTabs.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => selectCategory(slug)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  activeCategory === slug
                    ? "border-heritage-green bg-heritage-green/10 text-heritage-green"
                    : "border-border bg-white text-muted-foreground hover:border-fresh-leaf"
                )}
              >
                {categoryLabel(slug, visibleCategories)}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl bg-soft-oat/50 py-16 text-center">
          <p className="font-display text-xl text-espresso">No items found</p>
          <p className="mt-2 text-muted-foreground">
            Try another category or search term, or visit us for today&apos;s
            specials.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item._id} hover padding="md" className="relative h-full">
              <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-fresh-leaf via-butter-gold to-warm-terracotta"
                aria-hidden
              />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg text-espresso">
                      {item.name}
                    </h3>
                    {item.isPopular && (
                      <span className="rounded-full bg-butter-gold/90 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-espresso">
                        Popular
                      </span>
                    )}
                  </div>
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
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
