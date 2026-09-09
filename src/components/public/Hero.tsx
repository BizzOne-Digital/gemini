import Image from "next/image";
import { resolveImageSrc } from "@/lib/resolve-image";
import Link from "next/link";
import { ChevronRight, Leaf } from "lucide-react";
import { FadeIn, FadeInImmediate } from "@/components/public/animations/FadeIn";

interface HeroProps {
  headline?: string;
  subheadline?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  image?: string;
  imageAlt?: string;
}

const HERO_IMAGE = "/images/hero-breakfast.jpg";

export function Hero({
  headline = "Homemade Comfort Food, Served with Heart.",
  subheadline = "From hearty breakfasts to slow-cooked favourites and freshly baked pies, enjoy the flavours of home in the heart of Waterloo.",
  primaryCta = { label: "Explore Our Menu", href: "/menu" },
  secondaryCta = { label: "Book a Table", href: "/booking" },
  image = HERO_IMAGE,
  imageAlt = "Hearty homestyle breakfast with pancakes, eggs, bacon, and coffee at Homestyle Diner",
}: HeroProps) {
  const heroImage = resolveImageSrc(image, HERO_IMAGE);

  return (
    <section className="section-safe relative overflow-hidden bg-warm-cream">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-0 top-16 h-48 w-48 rounded-full bg-fresh-leaf/20 blur-3xl animate-glow-pulse sm:h-72 sm:w-72" />
        <div
          className="absolute right-0 top-1/3 h-40 w-40 rounded-full bg-butter-gold/15 blur-3xl animate-glow-pulse sm:h-64 sm:w-64"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          className="object-cover object-[65%_center] sm:object-[70%_center] lg:object-right"
          sizes="100vw"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-warm-cream via-warm-cream/95 to-warm-cream/10 sm:from-warm-cream sm:via-warm-cream/88 sm:to-transparent lg:via-warm-cream/70 lg:to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-fresh-leaf/5 via-transparent to-butter-gold/10"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 left-0 w-full max-w-3xl opacity-40 mix-blend-multiply lg:max-w-[55%]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
      </div>

      <div className="container-diner relative z-10">
        <div className="flex min-h-[calc(100vh-7.5rem)] min-h-[calc(100dvh-7.5rem)] flex-col justify-center py-12 sm:py-16 lg:min-h-[calc(92vh-7.5rem)] lg:max-w-[52%] lg:py-20">
          <FadeInImmediate delay={0.1}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-heritage-green/25 bg-gradient-to-r from-white/80 via-warm-cream/90 to-soft-oat/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-heritage-green shadow-soft backdrop-blur-sm">
              <Leaf className="h-3.5 w-3.5 text-fresh-leaf" />
              Family Owned Since 1987
            </div>
          </FadeInImmediate>

          <FadeInImmediate delay={0.2}>
            <h1 className="font-display text-[1.75rem] leading-[1.12] min-[375px]:text-[2rem] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              <span className="text-gradient-green">{headline}</span>
            </h1>
            <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-fresh-leaf via-butter-gold to-warm-terracotta" />
          </FadeInImmediate>

          <FadeInImmediate delay={0.35}>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-espresso/75 sm:text-lg">
              {subheadline}
            </p>
          </FadeInImmediate>

          <FadeIn delay={0.5} className="mt-8 flex flex-wrap gap-3 sm:gap-4">
            <Link
              href={primaryCta.href}
              className="group inline-flex h-12 items-center gap-1.5 rounded-full bg-gradient-to-r from-deep-forest via-heritage-green to-fresh-leaf px-6 text-sm font-semibold uppercase tracking-wider text-warm-cream shadow-soft transition-all hover:shadow-elevated hover:brightness-110 glow-green"
            >
              {primaryCta.label}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={secondaryCta.href}
              className="inline-flex h-12 items-center rounded-full border-2 border-heritage-green/30 bg-gradient-to-br from-white/90 to-warm-cream/80 px-6 text-sm font-semibold uppercase tracking-wider text-heritage-green backdrop-blur-sm transition-all hover:border-heritage-green hover:shadow-soft"
            >
              {secondaryCta.label}
            </Link>
          </FadeIn>

          <FadeIn delay={0.65} className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gradient-gold">
              Dine-In • Takeout • Catering
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="relative z-10 h-4 w-full pattern-checkerboard" aria-hidden />
      <div className="section-divider-gradient relative z-10" aria-hidden />

      <span className="sr-only">
        <Image src={heroImage} alt={imageAlt} width={1} height={1} />
      </span>
    </section>
  );
}
