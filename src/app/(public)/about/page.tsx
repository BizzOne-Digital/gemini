import type { Metadata } from "next";
import Image from "next/image";
import { Heart, Clock, Users } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { getPageContent, getPublicSiteSettings } from "@/lib/site-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { FadeIn } from "@/components/public/animations/FadeIn";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/public/animations/StaggerChildren";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import { resolveImageSrc } from "@/lib/resolve-image";
import { getSection } from "@/types/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/about", {
    title: "About Us",
    description:
      "Learn about Homestyle Diner — a family-owned Waterloo restaurant serving homemade comfort food since 1987.",
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca";

export default async function AboutPage() {
  const [pageContent, settings] = await Promise.all([
    getPageContent("about").catch(() => null),
    getPublicSiteSettings(),
  ]);

  const intro = getSection(pageContent?.sections, "intro");
  const values = getSection(pageContent?.sections, "values");

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "About", url: `${siteUrl}/about` },
        ]}
      />

      <section className="section-safe gradient-green overflow-x-clip pb-12 pt-[calc(var(--header-height)+3rem)] sm:pb-16">
        <div className="container-diner">
          <FadeIn>
            <SectionHeading
              eyebrow="Our Story"
              title={pageContent?.pageTitle || "About Homestyle Diner"}
              description={
                intro?.description ||
                "For nearly four decades, we've been Waterloo's home for honest, homemade cooking — where every guest is treated like family."
              }
              light
            />
          </FadeIn>
        </div>
      </section>

      <section className="section-safe py-12 sm:py-16 lg:py-20">
        <div className="container-diner">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <div className="prose-diner space-y-4">
                <p>
                  {intro?.subheading ||
                    "Homestyle Diner opened its doors in 1987 with a simple promise: serve the kind of food you'd find at a family Sunday dinner — generous portions, familiar flavours, and recipes made from scratch."}
                </p>
                <p>
                  Today, {settings.publicBusinessName} remains independently
                  owned and operated by the same family values that started it
                  all. From students grabbing breakfast before class to
                  professionals meeting for lunch and families celebrating
                  milestones, our dining room has welcomed generations of
                  Waterloo neighbours.
                </p>
                <p>
                  We believe great food doesn't need to be complicated. Our
                  kitchen team arrives early each morning to prepare soups,
                  sauces, and baked goods by hand. When you dine with us, you're
                  tasting decades of care in every bite.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2} direction="left">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-elevated">
                <Image
                  src={resolveImageSrc(
                    intro?.image,
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                  )}
                  alt={
                    intro?.imageAlt ||
                    "Warm and welcoming dining room at Homestyle Diner"
                  }
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="section-safe bg-soft-oat/40 py-12 sm:py-16 lg:py-20">
        <div className="container-diner">
          <FadeIn className="mb-12">
            <SectionHeading
              eyebrow={values?.eyebrow || "What We Stand For"}
              title={values?.heading || "Our Values"}
              align="center"
              className="mx-auto"
            />
          </FadeIn>
          <StaggerChildren className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Hospitality First",
                text: "Every guest deserves a warm welcome and a seat at our table.",
              },
              {
                icon: Clock,
                title: "Time-Honoured Recipes",
                text: "Slow cooking and scratch preparation — never shortcuts.",
              },
              {
                icon: Users,
                title: "Community Roots",
                text: "Proudly serving Waterloo families, students, and businesses since 1987.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <Card hover className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-soft-oat text-heritage-green">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{title}</CardTitle>
                  <CardDescription>{text}</CardDescription>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="section-safe py-12 sm:py-16 lg:py-20">
        <div className="container-diner text-center">
          <FadeIn>
            <h2 className="font-display text-3xl text-espresso">
              Come Taste the Difference
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              We&apos;d love to welcome you to our table. Browse our menu or
              book a reservation today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/menu" variant="primary" size="lg">
                View Menu
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                Contact Us
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
