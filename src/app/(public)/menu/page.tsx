import type { Metadata } from "next";
import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/metadata";
import {
  getMenuCategories,
  getMenuItems,
  getPublicSiteSettings,
} from "@/lib/site-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MenuBrowser } from "@/components/public/MenuBrowser";
import { FadeIn } from "@/components/public/animations/FadeIn";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import type { MenuCategoryData, MenuItemData } from "@/types/site";
import type { MenuGroupId } from "@/lib/menu-groups";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/menu", {
    title: "Menu",
    description:
      "Browse the Homestyle Diner menu — hearty breakfasts, homestyle mains, fresh salads, and homemade baked goods in Waterloo, ON.",
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca";

type MenuPageProps = {
  searchParams: Promise<{ category?: string; group?: string }>;
};

function resolveGroup(param?: string): MenuGroupId {
  if (param === "lunch-dinner") return "lunch-dinner";
  if (param === "bakery-desserts") return "bakery-desserts";
  if (param === "drinks") return "drinks";
  if (param === "specials") return "specials";
  return "breakfast";
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const initialGroup = resolveGroup(params.group);
  const initialCategory = params.category;

  const [categories, items, settings] = await Promise.all([
    getMenuCategories().catch((): MenuCategoryData[] => []),
    getMenuItems().catch((): MenuItemData[] => []),
    getPublicSiteSettings(),
  ]);

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Menu", url: `${siteUrl}/menu` },
        ]}
      />

      <section className="section-safe gradient-green overflow-x-clip pb-12 pt-[calc(var(--header-height)+3rem)]">
        <div className="container-diner">
          <FadeIn>
            <SectionHeading
              eyebrow="Homemade & Hearty"
              title="Our Menu"
              description="From sunrise breakfasts to homestyle dinners and fresh-baked pies — every dish is made from scratch with care."
              light
            />
          </FadeIn>
        </div>
      </section>

      <section className="section-safe py-12 sm:py-16 lg:py-20">
        <div className="container-diner">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-soft-oat/50" />}>
            <MenuBrowser
              categories={categories}
              items={items}
              initialGroup={initialGroup}
              initialCategory={initialCategory}
            />
          </Suspense>

          <FadeIn className="mt-12 rounded-xl bg-soft-oat/60 p-4 text-center text-sm text-muted-foreground">
            {settings.pricingDisclaimer}
          </FadeIn>
        </div>
      </section>
    </>
  );
}
