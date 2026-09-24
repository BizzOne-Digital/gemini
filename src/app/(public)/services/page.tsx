import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { getServices } from "@/lib/site-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/public/animations/FadeIn";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/public/animations/StaggerChildren";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import type { ServiceData } from "@/types/site";
import { resolveImageSrc } from "@/lib/resolve-image";
import { SITE_PHOTOS } from "@/lib/site-photos";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/services", {
    title: "Services",
    description:
      "Dine-in, takeout, catering, group dining, and business lunches at Homestyle Diner in Waterloo, ON.",
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca";

const SERVICE_IMAGES: Record<string, string> = {
  breakfast: SITE_PHOTOS.breakfastBenedict,
  lunch: SITE_PHOTOS.lunchBurger,
  dinner: SITE_PHOTOS.foodDinner,
  bakery: SITE_PHOTOS.bakery,
  "bakery-desserts": SITE_PHOTOS.bakeryAlt,
  "dine-in": SITE_PHOTOS.welcome,
  takeout: SITE_PHOTOS.foodFishTray,
  catering: SITE_PHOTOS.catering,
  "group-dining": SITE_PHOTOS.groupDining,
};

function getServiceImage(service: ServiceData, index: number): string {
  const fallbacks = Object.values(SERVICE_IMAGES);
  const fallback = SERVICE_IMAGES[service.slug] || fallbacks[index % fallbacks.length];
  if (service.image) return resolveImageSrc(service.image, fallback);
  return fallback;
}

const DEFAULT_SERVICES: ServiceData[] = [
  {
    _id: "dine-in",
    title: "Dine-In",
    slug: "dine-in",
    shortDescription:
      "Enjoy our warm, welcoming dining room for breakfast, lunch, or dinner.",
    fullDescription:
      "Our spacious dining room welcomes families, friends, and solo diners alike. Comfortable booths, friendly service, and homestyle cooking make every visit feel special.",
    ctaLabel: "View Menu",
    ctaHref: "/menu",
    isFeatured: true,
  },
  {
    _id: "takeout",
    title: "Takeout",
    slug: "takeout",
    shortDescription:
      "Call ahead and pick up your favourites — hot and ready when you arrive.",
    fullDescription:
      "Short on time? Order by phone and we'll have your meal prepared fresh for pickup. Perfect for busy weekdays or cozy nights in.",
    ctaLabel: "Contact Us",
    ctaHref: "/contact",
    isFeatured: true,
  },
  {
    _id: "catering",
    title: "Catering",
    slug: "catering",
    shortDescription:
      "Office lunches, meetings, and events catered with homestyle flavour.",
    fullDescription:
      "From corporate lunches to family gatherings, our catering team prepares generous trays of crowd-pleasing favourites. Custom menus available for groups of all sizes.",
    ctaLabel: "Request Catering",
    ctaHref: "/booking",
    isFeatured: true,
    image: "/images/service-catering.jpg",
  },
  {
    _id: "group-dining",
    title: "Group Dining",
    slug: "group-dining",
    shortDescription:
      "Celebrate birthdays, reunions, and special occasions with us.",
    fullDescription:
      "Planning a celebration? We accommodate groups with reserved seating, customized menus, and attentive service to make your event memorable.",
    ctaLabel: "Book a Group",
    ctaHref: "/booking",
    isFeatured: false,
    image: "/images/service-group-dining.png",
  },
];

export default async function ServicesPage() {
  const dbServices = await getServices().catch((): ServiceData[] => []);
  const services = dbServices.length > 0 ? dbServices : DEFAULT_SERVICES;

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Services", url: `${siteUrl}/services` },
        ]}
      />

      <section className="section-safe gradient-green-mesh overflow-x-clip pb-12 pt-[calc(var(--header-height)+3rem)]">
        <div className="container-diner">
          <FadeIn>
            <SectionHeading
              eyebrow="How We Serve You"
              title="Our Services"
              description="Whether you're dining in, picking up, or planning an event, Homestyle Diner has you covered."
              light
            />
          </FadeIn>
        </div>
      </section>

      <section className="section-safe gradient-cream-radial py-12 sm:py-16 lg:py-20">
        <div className="container-diner">
          <StaggerChildren className="space-y-12 lg:space-y-16">
            {services.map((service, index) => {
              const imageOnRight = index % 2 === 1;

              return (
                <StaggerItem key={service._id}>
                  <div id={service.slug} className="scroll-mt-28">
                  <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
                    {/* Image */}
                    <div
                      className={`min-w-0 ${imageOnRight ? "lg:order-2" : "lg:order-1"}`}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-elevated ring-1 ring-heritage-green/10">
                        <Image
                          src={getServiceImage(service, index)}
                          alt={service.imageAlt || service.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-forest/30 via-transparent to-butter-gold/10" />
                      </div>
                    </div>

                    {/* Text card */}
                    <div
                      className={`flex min-w-0 ${imageOnRight ? "lg:order-1" : "lg:order-2"}`}
                    >
                      <div className="flex w-full flex-col justify-center rounded-3xl border border-heritage-green/10 bg-gradient-to-br from-white via-warm-cream/80 to-soft-oat/40 p-6 shadow-soft sm:p-8 lg:p-10">
                        <h2 className="font-display text-2xl leading-tight text-gradient-green sm:text-3xl lg:text-4xl">
                          {service.title}
                        </h2>
                        <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-fresh-leaf via-butter-gold to-warm-terracotta opacity-80" />
                        <p className="mt-5 break-words text-base leading-relaxed text-muted-foreground">
                          {service.fullDescription || service.shortDescription}
                        </p>
                        <div className="mt-8">
                          <Button
                            href={service.ctaHref || "/contact"}
                            variant="primary"
                          >
                            {service.ctaLabel || "Learn More"}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>

          <FadeIn className="mt-16 lg:mt-20">
            <div className="rounded-3xl border border-heritage-green/10 bg-gradient-to-br from-soft-oat/80 via-warm-cream to-white p-8 text-center shadow-soft lg:p-12">
              <h2 className="font-display text-2xl text-gradient-green sm:text-3xl">
                Ready to Plan Your Visit?
              </h2>
              <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-fresh-leaf to-butter-gold opacity-70" />
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Contact us to discuss catering menus, group reservations, or any
                special requests.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button href="/booking" variant="primary">
                  Book Now
                </Button>
                <Button href="/contact" variant="outline">
                  Contact Us
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
