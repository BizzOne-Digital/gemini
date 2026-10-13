"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { GalleryImage } from "@/lib/gallery";
import { FadeIn } from "@/components/public/animations/FadeIn";

interface GalleryGridProps {
  images: GalleryImage[];
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [active, setActive] = useState<GalleryImage | null>(null);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl bg-soft-oat/50 py-16 text-center">
        <p className="font-display text-xl text-espresso">Gallery coming soon</p>
        <p className="mt-2 text-muted-foreground">
          We&apos;re adding photos of our food and dining room — check back shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((image, index) => (
          <FadeIn key={image.src} delay={Math.min(index * 0.03, 0.3)}>
            <button
              type="button"
              onClick={() => setActive(image)}
              className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/60 bg-soft-oat shadow-soft transition-shadow hover:shadow-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-fresh-leaf"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-deep-forest/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </button>
          </FadeIn>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photo"
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/80"
            onClick={() => setActive(null)}
            aria-label="Close"
          />
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-warm-cream/95 p-2 text-espresso shadow-elevated"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative z-10 max-h-[90vh] max-w-5xl w-full">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-charcoal">
              <Image
                src={active.src}
                alt={active.alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
