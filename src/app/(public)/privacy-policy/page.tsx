import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { getPublicSiteSettings } from "@/lib/site-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/public/animations/FadeIn";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/privacy-policy", {
    title: "Privacy Policy",
    description: "Privacy policy for Homestyle Diner website and services.",
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca";

export default async function PrivacyPolicyPage() {
  const settings = await getPublicSiteSettings();

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Privacy Policy", url: `${siteUrl}/privacy-policy` },
        ]}
      />

      <section className="section-safe overflow-x-clip pb-12 pt-[calc(var(--header-height)+3rem)] sm:pb-16">
        <div className="container-diner max-w-3xl">
          <FadeIn>
            <SectionHeading
              eyebrow="Legal"
              title="Privacy Policy"
              description={`Last updated: ${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}`}
            />

            <div className="prose-diner mt-10 space-y-6">
              <section>
                <h2 className="font-display text-xl text-espresso">
                  Introduction
                </h2>
                <p>
                  {settings.legalBusinessName} (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
                  or &ldquo;our&rdquo;) operates the {settings.publicBusinessName}{" "}
                  website and dining services. This Privacy Policy explains how we
                  collect, use, and protect your personal information when you
                  visit our website or interact with our services.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  Information We Collect
                </h2>
                <p>We may collect the following types of information:</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>
                    Contact information (name, email, phone) submitted through
                    our contact, booking, or review forms
                  </li>
                  <li>
                    Booking details (date, time, party size, dietary notes)
                  </li>
                  <li>
                    Technical data (IP address, browser type) collected
                    automatically when you visit our website
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  How We Use Your Information
                </h2>
                <p>We use your information to:</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Respond to inquiries and booking requests</li>
                  <li>Send confirmation emails related to your submissions</li>
                  <li>Moderate and publish approved guest reviews</li>
                  <li>Improve our website and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  Information Sharing
                </h2>
                <p>
                  We do not sell your personal information. We may share data with
                  service providers who assist in operating our website (such as
                  email delivery services) under strict confidentiality agreements.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  Your Rights
                </h2>
                <p>
                  Under applicable Canadian privacy law, you may request access
                  to, correction of, or deletion of your personal information.
                  Contact us at{" "}
                  <a
                    href={`mailto:${settings.primaryEmail}`}
                    className="text-heritage-green hover:underline"
                  >
                    {settings.primaryEmail}
                  </a>{" "}
                  to exercise these rights.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-espresso">
                  Contact Us
                </h2>
                <p>
                  If you have questions about this Privacy Policy, please contact
                  us at {settings.primaryEmail} or call {settings.phone}.
                </p>
              </section>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
