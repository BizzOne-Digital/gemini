import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, Share2 } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { getPublicSiteSettings } from "@/lib/site-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "@/components/public/forms/ContactForm";
import { FadeIn } from "@/components/public/animations/FadeIn";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import { formatPhone } from "@/lib/utils";
import {
  formatHoursSummary,
  getFullAddress,
  getPhoneHref,
} from "@/types/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/contact", {
    title: "Contact Us",
    description:
      "Get in touch with Homestyle Diner in Waterloo. Call, email, or send us a message — we'd love to hear from you.",
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca";

export default async function ContactPage() {
  const settings = await getPublicSiteSettings();
  const hoursSummary = settings.businessHours?.length
    ? formatHoursSummary(settings.businessHours)
    : "Mon–Sun 9:00 AM–7:00 PM";

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Contact", url: `${siteUrl}/contact` },
        ]}
      />

      <section className="section-safe gradient-green overflow-x-clip pb-12 pt-[calc(var(--header-height)+3rem)]">
        <div className="container-diner">
          <FadeIn>
            <SectionHeading
              eyebrow="Get in Touch"
              title="Contact Us"
              description="Questions about our menu, catering, or group dining? Send us a message and we'll respond as soon as we can."
              light
            />
          </FadeIn>
        </div>
      </section>

      <section className="section-safe py-12 sm:py-16 lg:py-20">
        <div className="container-diner">
          <div className="grid gap-12 lg:grid-cols-5">
            <FadeIn className="lg:col-span-2 space-y-6">
              <Card>
                <a
                  href={getPhoneHref(settings.phone)}
                  className="flex items-start gap-4 transition-colors hover:text-heritage-green"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft-oat text-heritage-green">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Phone
                    </p>
                    <p className="font-semibold text-espresso">
                      {formatPhone(settings.phone)}
                    </p>
                  </div>
                </a>
              </Card>

              <Card>
                <a
                  href={`mailto:${settings.primaryEmail}`}
                  className="flex items-start gap-4 transition-colors hover:text-heritage-green"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft-oat text-heritage-green">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="font-semibold text-espresso break-all">
                      {settings.primaryEmail}
                    </p>
                  </div>
                </a>
              </Card>

              <Card>
                <a
                  href={
                    settings.directionsUrl ||
                    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getFullAddress(settings))}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 transition-colors hover:text-heritage-green"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft-oat text-heritage-green">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Address
                    </p>
                    <p className="font-semibold text-espresso">
                      {getFullAddress(settings)}
                    </p>
                  </div>
                </a>
              </Card>

              <Card>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft-oat text-heritage-green">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Hours
                    </p>
                    <p className="font-semibold text-espresso">{hoursSummary}</p>
                  </div>
                </div>
              </Card>

              {settings.facebookUrl && (
                <Card>
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-heritage-green transition-colors hover:text-fresh-leaf"
                  >
                    <Share2 className="h-5 w-5" />
                    Follow us on Facebook
                  </a>
                </Card>
              )}
            </FadeIn>

            <FadeIn delay={0.15} className="lg:col-span-3">
              <Card padding="lg">
                <h2 className="font-display text-2xl text-espresso">
                  Send a Message
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill out the form below and we&apos;ll get back to you within
                  one business day.
                </p>
                <div className="mt-8">
                  <ContactForm />
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
