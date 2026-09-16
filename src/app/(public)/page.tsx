import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChefHat,
  Heart,
  Users,
  Briefcase,
  Cake,
  Star,
  MapPin,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import {
  getPublicSiteSettings,
  getPageContent,
  getMenuCategories,
  getMenuItems,
  getServices,
  getTestimonials,
} from "@/lib/site-data";
import { Hero } from "@/components/public/Hero";
import { resolveImageSrc } from "@/lib/resolve-image";
import { HOMESTYLE_TAGLINE } from "@/lib/copy";
import { SITE_PHOTOS } from "@/lib/site-photos";
import { QuickInfoStrip } from "@/components/public/QuickInfoStrip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { FadeIn } from "@/components/public/animations/FadeIn";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/public/animations/StaggerChildren";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { formatPrice, formatPhone } from "@/lib/utils";
import { getSection, getFullAddress, getPhoneHref } from "@/types/site";
import type { MenuCategoryData, MenuItemData, ServiceData, TestimonialData } from "@/types/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/", {
    title: "Homestyle Diner | Homemade Comfort Food in Waterloo, ON",
    description:
      "Family-owned diner in Waterloo since 1987. Hearty breakfasts, slow-cooked favourites, and freshly baked pies. Dine-in, takeout, catering, and group dining.",
  });
}

const FALLBACK_BAKERY = SITE_PHOTOS.bakery;
const FALLBACK_DINER = SITE_PHOTOS.welcome;

function getItemPrice(item: MenuItemData) {
  return formatPrice(item.salePrice ?? item.price, item.currency);
}

export default async function HomePage() {
  const settings = await getPublicSiteSettings();

  const [pageContent, categories, featuredItems, services, testimonials] =
    await Promise.all([
      getPageContent("home").catch(() => null),
      getMenuCategories(true).catch((): MenuCategoryData[] => []),
      getMenuItems({ featured: true }).catch((): MenuItemData[] => []),
      getServices(true).catch((): ServiceData[] => []),
      getTestimonials(true, true).catch((): TestimonialData[] => []),
    ]);

  const heroSection = getSection(pageContent?.sections, "hero");
  const welcomeSection = getSection(pageContent?.sections, "welcome");
  const differenceSection = getSection(pageContent?.sections, "difference");
  const bakerySection = getSection(pageContent?.sections, "bakery");

  return (
    <>
      <Hero
        headline={heroSection?.heading || "Homemade Comfort Food, Served with Heart."}
        subheadline={heroSection?.description || HOMESTYLE_TAGLINE}
        image={heroSection?.image || SITE_PHOTOS.hero}
        imageAlt={heroSection?.imageAlt}
        primaryCta={{
          label: heroSection?.ctaLabel || "See What's Cooking",
          href: heroSection?.ctaHref || "/menu",
        }}
        secondaryCta={{
          label:
            heroSection?.ctaSecondaryLabel ||
            (settings.orderOnlineUrl ? "Order Pickup" : "Book a Table"),
          href:
            heroSection?.ctaSecondaryHref ||
            (settings.orderOnlineUrl ? settings.orderOnlineUrl : "/booking"),
        }}
      />

      <QuickInfoStrip settings={settings} />

      {/* Welcome Story */}
      <section className="section-safe relative gradient-cream-radial py-12 sm:py-16 lg:py-28">
        <div className="container-diner">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <FadeIn>
              <SectionHeading
                eyebrow={welcomeSection?.eyebrow || "Our Story"}
                title={
                  welcomeSection?.heading ||
                  "A Waterloo Institution Since 1987"
                }
                description={
                  welcomeSection?.description ||
                  "For nearly four decades, Homestyle Diner has been a gathering place for families, students, and neighbours who crave honest, homemade cooking. From our legendary breakfasts to slow-simmered soups and pies baked fresh daily, everything on your plate is made with care — just like at home."
                }
              />
              <Button href="/about" variant="outline" className="mt-8">
                Read Our Story
                <ArrowRight className="h-4 w-4" />
              </Button>
            </FadeIn>
            <FadeIn delay={0.2} direction="left">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-elevated ring-2 ring-fresh-leaf/20">
                <Image
                  src={resolveImageSrc(welcomeSection?.image, FALLBACK_DINER)}
                  alt={
                    welcomeSection?.imageAlt ||
                    "Cozy interior of Homestyle Diner with warm lighting"
                  }
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-forest/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-warm-cream/95 p-4 backdrop-blur-sm">
                  <p className="font-display text-lg text-espresso">
                    &ldquo;Where neighbours become family.&rdquo;
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="section-safe relative bg-gradient-to-b from-soft-oat/50 via-warm-cream to-soft-oat/40 py-12 pattern-dots sm:py-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-r from-fresh-leaf/5 via-transparent to-butter-gold/5" aria-hidden />
        <div className="container-diner relative">
          <FadeIn className="mb-12">
            <SectionHeading
              eyebrow="Categories"
              title="Browse by Craving"
              description="Breakfast, lunch, dinner, and baked goods — made from scratch with care."
              align="center"
              className="mx-auto"
            />
          </FadeIn>

          {categories.length > 0 ? (
            <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 6).map((cat) => (
                <StaggerItem key={cat._id}>
                  <Link href={`/menu?category=${cat.slug}`}>
                    <Card hover padding="md" className="group h-full">
                      <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-fresh-leaf to-butter-gold transition-all group-hover:w-16" />
                      <CardTitle>{cat.name}</CardTitle>
                      {cat.description && (
                        <CardDescription>{cat.description}</CardDescription>
                      )}
                      {cat.startingPrice != null && (
                        <p className="mt-3 text-sm font-semibold text-heritage-green">
                          From {formatPrice(cat.startingPrice)}
                        </p>
                      )}
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <FadeIn>
              <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
                <ChefHat className="mx-auto h-12 w-12 text-fresh-leaf" />
                <p className="mt-4 font-display text-xl text-espresso">
                  Our full menu is waiting for you
                </p>
                <p className="mt-2 text-muted-foreground">
                  Visit us in person or browse our menu page for today&apos;s
                  offerings.
                </p>
                <Button href="/menu" variant="primary" className="mt-6">
                  View Full Menu
                </Button>
              </div>
            </FadeIn>
          )}

        </div>
      </section>

      {/* Signature Favourites */}
      <section className="section-safe py-12 sm:py-16 lg:py-28">
        <div className="container-diner">
          <FadeIn className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Guest Favourites"
              title="Signature Dishes"
              description="The plates our regulars order again and again — tried, tested, and truly homemade."
            />
            <Button href="/menu" variant="ghost">
              See All Items
              <ArrowRight className="h-4 w-4" />
            </Button>
          </FadeIn>

          {featuredItems.length > 0 ? (
            <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredItems.slice(0, 6).map((item: MenuItemData) => (
                <StaggerItem key={item._id}>
                  <Card hover padding="md" className="h-full">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle>{item.name}</CardTitle>
                      <span className="shrink-0 font-semibold text-heritage-green">
                        {getItemPrice(item)}
                      </span>
                    </div>
                    {item.description && (
                      <CardDescription className="line-clamp-2">
                        {item.description}
                      </CardDescription>
                    )}
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <FadeIn>
              <p className="text-center text-muted-foreground">
                Ask our team about today&apos;s chef specials when you visit.
              </p>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Homemade Difference */}
      <section className="section-safe relative overflow-hidden gradient-green-mesh py-12 sm:py-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-butter-gold/10 blur-3xl sm:h-80 sm:w-80" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-fresh-leaf/15 blur-3xl sm:h-64 sm:w-64" />
        </div>
        <div className="container-diner relative">
          <FadeIn>
            <SectionHeading
              eyebrow={differenceSection?.eyebrow || "The Homestyle Difference"}
              title={
                differenceSection?.heading || "Made Fresh, Never From a Box"
              }
              description={
                differenceSection?.description ||
                "We chop our vegetables by hand, simmer our soups for hours, and bake our pies from scratch every morning. No shortcuts — just honest homestyle cooking the way it should be."
              }
              light
              align="center"
              className="mx-auto"
            />
          </FadeIn>

          <StaggerChildren className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: ChefHat,
                title: "From Scratch",
                text: "Soups, sauces, and batters made in-house daily.",
              },
              {
                icon: Heart,
                title: "Made with Heart",
                text: "Family recipes passed down and perfected over decades.",
              },
              {
                icon: Star,
                title: "Local Favourites",
                text: "Beloved by Waterloo families, students, and professionals.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-butter-gold/25 to-warm-cream/10 text-butter-gold shadow-soft ring-1 ring-warm-cream/20">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-display text-xl text-warm-cream">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-warm-cream/75">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Audience CTAs */}
      <section className="section-safe gradient-cream-radial py-12 sm:py-16 lg:py-28">
        <div className="container-diner">
          <StaggerChildren className="grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Families & Friends",
                text: "Spacious booths, kid-friendly options, and portions big enough to share.",
                href: "/menu",
                cta: "Family Menu",
              },
              {
                icon: Briefcase,
                title: "Business Lunches",
                text: "Quick, satisfying meals for professionals on the go. Group bookings welcome.",
                href: "/booking",
                cta: "Book Lunch",
              },
              {
                icon: Cake,
                title: "Special Occasions",
                text: "Birthdays, anniversaries, and group celebrations made memorable.",
                href: "/services",
                cta: "Our Services",
              },
            ].map(({ icon: Icon, title, text, href, cta }) => (
              <StaggerItem key={title}>
                <Card hover className="h-full flex flex-col">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-heritage-green/15 to-fresh-leaf/25 text-heritage-green">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{title}</CardTitle>
                  <CardDescription className="flex-1">{text}</CardDescription>
                  <Button href={href} variant="ghost" className="mt-4 self-start px-0">
                    {cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Services Preview */}
      <section className="section-safe bg-gradient-to-b from-warm-cream via-soft-oat/50 to-warm-cream py-12 sm:py-16 lg:py-28">
        <div className="container-diner">
          <FadeIn className="mb-12">
            <SectionHeading
              eyebrow="More Than a Meal"
              title="Dining Services"
              description="Whether you're planning a casual lunch or a full catering spread, we're here to make it easy."
              align="center"
              className="mx-auto"
            />
          </FadeIn>

          {services.length > 0 ? (
            <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 3).map((service) => (
                <StaggerItem key={service._id}>
                  <Card hover className="h-full">
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.shortDescription}</CardDescription>
                    <Button
                      href={service.ctaHref || "/contact"}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      {service.ctaLabel || "Learn More"}
                    </Button>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <FadeIn>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    title: "Dine-In",
                    desc: "Warm, welcoming atmosphere for every meal of the day.",
                  },
                  {
                    title: "Takeout",
                    desc: "Call ahead and pick up your favourites ready to go.",
                  },
                  {
                    title: "Catering",
                    desc: "Office lunches, events, and gatherings made delicious.",
                  },
                ].map((s) => (
                  <Card key={s.title} hover>
                    <CardTitle>{s.title}</CardTitle>
                    <CardDescription>{s.desc}</CardDescription>
                  </Card>
                ))}
              </div>
            </FadeIn>
          )}

          <FadeIn className="mt-10 text-center">
            <Button href="/services" variant="primary">
              View All Services
              <ArrowRight className="h-4 w-4" />
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* Bakery Feature */}
      <section className="section-safe py-12 sm:py-16 lg:py-28">
        <div className="container-diner">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <FadeIn direction="right">
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-elevated">
                <Image
                  src={resolveImageSrc(bakerySection?.image, FALLBACK_BAKERY)}
                  alt={
                    bakerySection?.imageAlt ||
                    "Fresh homemade pies and baked goods"
                  }
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <SectionHeading
                eyebrow={bakerySection?.eyebrow || "Fresh Daily"}
                title={bakerySection?.heading || "Homemade Pies & Baked Goods"}
                description={
                  bakerySection?.description ||
                  "Our bakers arrive before dawn to prepare flaky crusts, fruit fillings, and buttery pastries. From classic apple pie to seasonal specials, every bite tastes like it came from grandma's kitchen."
                }
              />
              <Button href="/menu" variant="secondary" className="mt-8">
                Browse Bakery Items
                <ArrowRight className="h-4 w-4" />
              </Button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="section-safe relative overflow-hidden gradient-green-mesh py-12 sm:py-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-forest/50 to-transparent" aria-hidden />
        <div className="container-diner relative">
          <FadeIn className="mb-12">
            <SectionHeading
              eyebrow="Guest Reviews"
              title="What Our Neighbours Say"
              description="Real reviews from guests who've shared their Homestyle experience."
              light
              align="center"
              className="mx-auto"
            />
          </FadeIn>

          {testimonials.length > 0 ? (
            <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <StaggerItem key={t._id}>
                  <TestimonialCard testimonial={t} featured />
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <FadeIn>
              <div className="rounded-2xl border border-warm-cream/10 bg-warm-cream/5 p-12 text-center">
                <Star className="mx-auto h-10 w-10 text-butter-gold" />
                <p className="mt-4 text-warm-cream/80">
                  Be the first to share your experience — we&apos;d love to
                  hear from you.
                </p>
                <Button
                  href="/testimonials"
                  variant="secondary"
                  className="mt-6"
                >
                  Leave a Review
                </Button>
              </div>
            </FadeIn>
          )}

          {testimonials.length > 0 && (
            <FadeIn className="mt-10 text-center">
              <Button
                href="/testimonials"
                variant="outline"
                className="border-warm-cream/30 text-warm-cream hover:bg-white/10"
              >
                Read All Reviews
              </Button>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Location */}
      <section className="section-safe py-12 sm:py-16 lg:py-28">
        <div className="container-diner">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <FadeIn>
              <SectionHeading
                eyebrow="Find Us"
                title="Visit Homestyle Diner"
                description="Located in the heart of Waterloo on Albert Street — easy to find, hard to leave."
              />
              <div className="mt-8 space-y-4">
                <a
                  href={
                    settings.directionsUrl ||
                    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getFullAddress(settings))}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-muted-foreground transition-colors hover:text-espresso"
                >
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-fresh-leaf" />
                  {getFullAddress(settings)}
                </a>
                <a
                  href={getPhoneHref(settings.phone)}
                  className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-espresso"
                >
                  <Phone className="h-5 w-5 shrink-0 text-fresh-leaf" />
                  {formatPhone(settings.phone)}
                </a>
              </div>
              <Button
                href={
                  settings.directionsUrl ||
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getFullAddress(settings))}`
                }
                variant="primary"
                className="mt-8"
                external
              >
                Get Directions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </FadeIn>
            <FadeIn delay={0.2} direction="left">
              <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-3xl shadow-elevated">
                <iframe
                  title="Homestyle Diner location map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(getFullAddress(settings))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-safe pb-12 sm:pb-16 lg:pb-28">
        <div className="container-diner">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl gradient-green-animated px-5 py-12 text-center shadow-elevated glow-green sm:px-8 sm:py-16 lg:px-16 lg:py-20">
              <div className="pointer-events-none absolute inset-0 pattern-diagonal opacity-30" />
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-butter-gold/20 blur-3xl sm:h-64 sm:w-64" />
                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-fresh-leaf/20 blur-3xl sm:h-64 sm:w-64" />
              </div>
              <div className="relative">
                <h2 className="font-display text-3xl text-warm-cream sm:text-4xl lg:text-5xl">
                  Ready for Homestyle Comfort?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-warm-cream/80">
                  Join us for breakfast, lunch, or dinner — or let us cater your
                  next gathering. We can&apos;t wait to serve you.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {settings.orderOnlineUrl ? (
                    <Button
                      href={settings.orderOnlineUrl}
                      variant="secondary"
                      size="lg"
                      external
                    >
                      Order Pickup
                    </Button>
                  ) : (
                    <Button href="/menu" variant="secondary" size="lg">
                      See Our Food
                    </Button>
                  )}
                  <Button
                    href="/booking"
                    variant="outline"
                    size="lg"
                    className="border-warm-cream/40 text-warm-cream hover:bg-white/10"
                  >
                    Book a Table
                  </Button>
                  <Button
                    href={getPhoneHref(settings.phone)}
                    variant="ghost"
                    size="lg"
                    className="text-warm-cream hover:bg-white/10"
                  >
                    <Phone className="h-5 w-5" />
                    {formatPhone(settings.phone)}
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
