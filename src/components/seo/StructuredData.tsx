import type { SiteSettingsData } from "@/types/site";

interface StructuredDataProps {
  settings: SiteSettingsData;
}

export function StructuredData({ settings }: StructuredDataProps) {
  const openingHours =
    settings.businessHours?.length > 0
      ? settings.businessHours
          .filter((h) => !h.isClosed)
          .map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: h.day,
            opens: h.open,
            closes: h.close,
          }))
      : [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "09:00",
            closes: "19:00",
          },
        ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.publicBusinessName,
    legalName: settings.legalBusinessName,
    description:
      settings.footerDescription ||
      "Family-owned diner in Waterloo since 1987. Homemade comfort food, served with heart.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca",
    telephone: settings.phone,
    email: settings.primaryEmail,
    image:
      settings.logos?.main ||
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: settings.city,
      addressRegion: settings.province,
      postalCode: settings.postalCode,
      addressCountry: settings.country || "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.4723,
      longitude: -80.5449,
    },
    openingHoursSpecification: openingHours,
    servesCuisine: ["Canadian", "Comfort Food", "Breakfast", "Homestyle"],
    priceRange: "$$",
    sameAs: settings.facebookUrl ? [settings.facebookUrl] : [],
    foundingDate: "1987",
    acceptsReservations: settings.bookingEnabled ? "True" : "False",
    hasMenu: `${process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca"}/menu`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
