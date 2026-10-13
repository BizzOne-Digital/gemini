import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { getGalleryImages } from "@/lib/gallery";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { FadeIn } from "@/components/public/animations/FadeIn";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/gallery", {
    title: "Gallery",
    description:
      "Photos from Homestyle Diner in Waterloo — homestyle meals, fresh baking, and our welcoming dining room.",
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca";

export default function GalleryPage() {
  const images = getGalleryImages();

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Gallery", url: `${siteUrl}/gallery` },
        ]}
      />

      <section className="section-safe gradient-green overflow-x-clip pb-12 pt-[calc(var(--header-height)+3rem)]">
        <div className="container-diner">
          <FadeIn>
            <SectionHeading
              eyebrow="Homestyle Diner"
              title="Gallery"
              description="A look at our food, baking, and the place we call home in Waterloo."
              light
            />
          </FadeIn>
        </div>
      </section>

      <section className="section-safe py-12 sm:py-16 lg:py-20">
        <div className="container-diner">
          <GalleryGrid images={images} />
        </div>
      </section>
    </>
  );
}
