import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { getPublicSiteSettings } from "@/lib/site-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/public/animations/FadeIn";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/terms", {
    title: "Terms of Use",
    description: "Terms of use for the Homestyle Diner website.",
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca";

export default async function TermsPage() {
  const settings = await getPublicSiteSettings();

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Terms of Use", url: `${siteUrl}/terms` },
        ]}
      />

      <section className="section-safe overflow-x-clip pb-12 pt-[calc(var(--header-height)+3rem)] sm:pb-16">
        <div className="container-diner max-w-3xl">
          <FadeIn>
            <SectionHeading
              eyebrow="Legal"
              title="Terms of Use"
              description={`Last updated: ${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}`}
            />

            <div className="prose-diner mt-10 space-y-6">
              <section>
                <h2 className="font-display text-xl text-espresso">
                  Acceptance of Terms
                </h2>
                <p>
                  By accessing and using the {settings.publicBusinessName}{" "}
                  website, you agree to these Terms of Use. If you do not agree,
                  please do not use our website.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  Use of Website
                </h2>
                <p>
                  This website is provided for informational purposes and to
                  facilitate contact, bookings, and reviews. You agree to use the
                  website only for lawful purposes and not to submit false or
                  misleading information through our forms.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  Menu & Pricing
                </h2>
                <p>
                  {settings.pricingDisclaimer} Images on this website may not
                  reflect current menu items. Please contact us directly for the
                  most up-to-date information.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  Bookings & Reservations
                </h2>
                <p>
                  Online booking requests are subject to confirmation by our
                  staff. Submission of a booking form does not guarantee a
                  reservation until confirmed by {settings.publicBusinessName}.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  User Submissions
                </h2>
                <p>
                  By submitting a review or testimonial, you grant us permission
                  to publish your submission (after moderation) on our website and
                  marketing materials. We reserve the right to edit or remove
                  submissions at our discretion.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  Limitation of Liability
                </h2>
                <p>
                  {settings.legalBusinessName} shall not be liable for any
                  damages arising from the use of this website. The website is
                  provided &ldquo;as is&rdquo; without warranties of any kind.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  Governing Law
                </h2>
                <p>
                  These terms are governed by the laws of the Province of Ontario
                  and the federal laws of Canada applicable therein.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  Contact
                </h2>
                <p>
                  Questions about these terms? Contact us at{" "}
                  <a
                    href={`mailto:${settings.primaryEmail}`}
                    className="text-heritage-green hover:underline"
                  >
                    {settings.primaryEmail}
                  </a>
                  .
                </p>
              </section>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
