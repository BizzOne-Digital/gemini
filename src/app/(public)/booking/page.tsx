import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { getPublicSiteSettings } from "@/lib/site-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { BookingForm } from "@/components/public/forms/BookingForm";
import { FadeIn } from "@/components/public/animations/FadeIn";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import { formatPhone } from "@/lib/utils";
import { getPhoneHref } from "@/types/site";
import { Phone, Info } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/booking", {
    title: "Book a Table",
    description:
      "Request a table reservation, group dining, catering, or special event booking at Homestyle Diner in Waterloo.",
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca";

export default async function BookingPage() {
  const settings = await getPublicSiteSettings();

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Booking", url: `${siteUrl}/booking` },
        ]}
      />

      <section className="section-safe gradient-green overflow-x-clip pb-12 pt-[calc(var(--header-height)+3rem)]">
        <div className="container-diner">
          <FadeIn>
            <SectionHeading
              eyebrow="Reservations"
              title="Book With Us"
              description="Request a table, group dining experience, catering quote, or special event booking. We'll confirm your reservation shortly."
              light
            />
          </FadeIn>
        </div>
      </section>

      <section className="section-safe py-12 sm:py-16 lg:py-20">
        <div className="container-diner">
          <div className="grid gap-12 lg:grid-cols-5">
            <FadeIn className="lg:col-span-2 space-y-6">
              <Card className="bg-soft-oat/40">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-heritage-green" />
                  <div>
                    <h3 className="font-display text-lg text-espresso">
                      How Booking Works
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li>Submit your request using the form</li>
                      <li>Receive a confirmation email with your reference number</li>
                      <li>Our team will contact you to finalize details</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-heritage-green" />
                  <div>
                    <h3 className="font-display text-lg text-espresso">
                      Prefer to Call?
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      For same-day reservations or urgent requests, call us
                      directly.
                    </p>
                    <a
                      href={getPhoneHref(settings.phone)}
                      className="mt-3 inline-block font-semibold text-heritage-green hover:text-fresh-leaf"
                    >
                      {formatPhone(settings.phone)}
                    </a>
                  </div>
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.15} className="lg:col-span-3">
              <Card padding="lg">
                <BookingForm bookingEnabled={settings.bookingEnabled} />
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
