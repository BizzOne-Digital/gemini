import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { getTestimonials } from "@/lib/site-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { TestimonialForm } from "@/components/public/forms/TestimonialForm";
import { FadeIn } from "@/components/public/animations/FadeIn";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/public/animations/StaggerChildren";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import { Star } from "lucide-react";
import type { TestimonialData } from "@/types/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/testimonials", {
    title: "Testimonials",
    description:
      "Read guest reviews of Homestyle Diner in Waterloo and share your own dining experience.",
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials(true).catch((): TestimonialData[] => []);

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Testimonials", url: `${siteUrl}/testimonials` },
        ]}
      />

      <section className="section-safe gradient-green overflow-x-clip pb-12 pt-[calc(var(--header-height)+3rem)]">
        <div className="container-diner">
          <FadeIn>
            <SectionHeading
              eyebrow="Guest Voices"
              title="Testimonials"
              description="Honest reviews from guests who've shared their Homestyle experience with us."
              light
            />
          </FadeIn>
        </div>
      </section>

      <section className="section-safe py-12 sm:py-16 lg:py-20">
        <div className="container-diner">
          {testimonials.length > 0 ? (
            <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <StaggerItem key={t._id}>
                  <TestimonialCard testimonial={t} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <FadeIn>
              <div className="rounded-2xl bg-soft-oat/50 py-16 text-center">
                <Star className="mx-auto h-12 w-12 text-butter-gold" />
                <p className="mt-4 font-display text-xl text-espresso">
                  No approved reviews yet
                </p>
                <p className="mt-2 text-muted-foreground">
                  Be among the first to share your experience dining with us.
                </p>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      <section className="section-safe bg-soft-oat/40 py-12 sm:py-16 lg:py-20">
        <div className="container-diner">
          <div className="grid gap-12 lg:grid-cols-2">
            <FadeIn>
              <SectionHeading
                eyebrow="Share Your Story"
                title="Leave a Review"
                description="Visited us recently? We'd love to hear about your experience. Reviews are moderated before appearing on our website."
              />
            </FadeIn>
            <FadeIn delay={0.15}>
              <Card padding="lg">
                <TestimonialForm />
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
