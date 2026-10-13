import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import {
  getMenuCategories,
  getMenuItems,
  getPublicSiteSettings,
} from "@/lib/site-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/public/animations/FadeIn";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import { formatPrice } from "@/lib/utils";
import type { MenuCategoryData, MenuItemData } from "@/types/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/pricing", {
    title: "Pricing",
    description:
      "View menu pricing at Homestyle Diner in Waterloo. Prices pulled from our current menu offerings.",
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca";

function getCategoryName(item: MenuItemData): string {
  if (typeof item.category === "object" && item.category?.name) {
    return item.category.name;
  }
  return "Other";
}

export default async function PricingPage() {
  const [categories, items, settings] = await Promise.all([
    getMenuCategories().catch((): MenuCategoryData[] => []),
    getMenuItems().catch((): MenuItemData[] => []),
    getPublicSiteSettings(),
  ]);

  const availableItems = (items as MenuItemData[]).filter(
    (item) => item.isAvailable
  );

  const grouped = categories.length
    ? categories.map((cat) => ({
        category: cat.name,
        items: availableItems.filter(
          (item) =>
            typeof item.category === "object" &&
            item.category?.slug === cat.slug
        ),
      }))
    : [
        {
          category: "Menu Items",
          items: availableItems,
        },
      ];

  const filteredGroups = grouped.filter((g) => g.items.length > 0);

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Pricing", url: `${siteUrl}/pricing` },
        ]}
      />

      <section className="section-safe gradient-green overflow-x-clip pb-12 pt-[calc(var(--header-height)+3rem)]">
        <div className="container-diner">
          <FadeIn>
            <SectionHeading
              eyebrow="Transparent Pricing"
              title="Menu Pricing"
              description="Current prices from our menu. All prices in Canadian dollars."
              light
            />
          </FadeIn>
        </div>
      </section>

      <section className="section-safe py-12 sm:py-16 lg:py-20">
        <div className="container-diner">
          {filteredGroups.length > 0 ? (
            <div className="space-y-12">
              {filteredGroups.map((group) => (
                <FadeIn key={group.category}>
                  <h2 className="font-display text-2xl text-espresso border-b border-border pb-3">
                    {group.category}
                  </h2>
                  <div className="mt-4 divide-y divide-border/60">
                    {group.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-start justify-between gap-4 py-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-espresso">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          {!categories.length && (
                            <p className="mt-0.5 text-xs text-fresh-leaf">
                              {getCategoryName(item)}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 font-semibold text-heritage-green">
                          {formatPrice(
                            item.salePrice ?? item.price,
                            item.currency
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : (
            <FadeIn>
              <div className="rounded-2xl bg-soft-oat/50 py-16 text-center">
                <p className="font-display text-xl text-espresso">
                  Pricing unavailable online
                </p>
                <p className="mt-2 text-muted-foreground">
                  Please visit us in person or call for current menu prices.
                </p>
              </div>
            </FadeIn>
          )}

          <FadeIn className="mt-12 rounded-xl bg-soft-oat/60 p-4 text-center text-sm text-muted-foreground">
            {settings.pricingDisclaimer}
          </FadeIn>
        </div>
      </section>
    </>
  );
}
