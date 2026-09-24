import { Clock, MapPin, Phone, Utensils } from "lucide-react";
import { formatPhone } from "@/lib/utils";
import type { SiteSettingsData } from "@/types/site";
import { getFullAddress, getPhoneHref } from "@/types/site";
import { BusinessHoursDisplay } from "@/components/public/BusinessHoursDisplay";
import { FadeIn } from "@/components/public/animations/FadeIn";

interface QuickInfoStripProps {
  settings: SiteSettingsData;
}

const cellClassName =
  "flex min-w-0 items-start gap-3 overflow-hidden rounded-xl p-2.5";

export function QuickInfoStrip({ settings }: QuickInfoStripProps) {
  const hours = settings.businessHours?.length ? settings.businessHours : [];
  const fullAddress = getFullAddress(settings);

  const items = [
    { icon: Clock, label: "Today's Hours", hours },
    {
      icon: MapPin,
      label: "Visit Us",
      value: fullAddress,
      href:
        settings.directionsUrl ||
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`,
    },
    {
      icon: Phone,
      label: "Call Us",
      value: formatPhone(settings.phone),
      href: getPhoneHref(settings.phone),
    },
    {
      icon: Utensils,
      label: "Dine-In & Takeout",
      value: "Breakfast, lunch & dinner made from scratch",
    },
  ];

  return (
    <section className="section-safe relative z-10 -mt-6 pb-4 sm:-mt-8">
      <div className="container-diner">
        <FadeIn>
          <div className="gradient-border glow-green rounded-2xl shadow-elevated">
            <div className="grid min-w-0 gap-3 bg-gradient-to-br from-white via-warm-cream to-soft-oat/60 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-2 lg:gap-4 lg:p-5 xl:grid-cols-4">
              {items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-heritage-green/15 to-fresh-leaf/20 text-heritage-green">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      {"hours" in item && item.hours ? (
                        <>
                          <p className="text-xs font-bold uppercase tracking-wider text-espresso">
                            {item.label}
                          </p>
                          <div className="mt-1 min-w-0">
                            <BusinessHoursDisplay hours={item.hours} variant="today" />
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-bold uppercase tracking-wider text-espresso">
                            {item.label}
                          </p>
                          <p
                            className="mt-0.5 truncate text-sm font-semibold leading-snug text-charcoal xl:whitespace-nowrap"
                            title={item.value}
                          >
                            {item.value}
                          </p>
                        </>
                      )}
                    </div>
                  </>
                );

                if (item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        item.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className={`${cellClassName} transition-all hover:bg-gradient-to-r hover:from-soft-oat/50 hover:to-fresh-leaf/10`}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div key={item.label} className={cellClassName}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
