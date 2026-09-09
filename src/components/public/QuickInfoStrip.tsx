import { Clock, MapPin, Phone, Utensils } from "lucide-react";
import { formatPhone } from "@/lib/utils";
import type { SiteSettingsData } from "@/types/site";
import {
  formatHoursSummary,
  getFullAddress,
  getPhoneHref,
} from "@/types/site";
import { FadeIn } from "@/components/public/animations/FadeIn";

interface QuickInfoStripProps {
  settings: SiteSettingsData;
}

export function QuickInfoStrip({ settings }: QuickInfoStripProps) {
  const hoursSummary = settings.businessHours?.length
    ? formatHoursSummary(settings.businessHours)
    : "Mon–Sun 9:00 AM–7:00 PM";

  const items = [
    { icon: Clock, label: "Open Daily", value: hoursSummary },
    {
      icon: MapPin,
      label: "Visit Us",
      value: getFullAddress(settings),
      href:
        settings.directionsUrl ||
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getFullAddress(settings))}`,
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
      value: "Comfort food made from scratch",
    },
  ];

  return (
    <section className="section-safe relative z-10 -mt-6 pb-4 sm:-mt-8">
      <div className="container-diner">
        <FadeIn>
          <div className="gradient-border glow-green rounded-2xl shadow-elevated">
            <div className="grid gap-2 bg-gradient-to-br from-white via-warm-cream to-soft-oat/60 p-3 sm:grid-cols-2 sm:gap-1 sm:p-4 lg:grid-cols-4 lg:p-5">
              {items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-heritage-green/15 to-fresh-leaf/20 text-heritage-green">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gradient-green">
                        {item.label}
                      </p>
                    <p className="mt-0.5 break-words text-sm font-medium leading-snug text-espresso">
                      {item.value}
                    </p>
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
                      className="flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-gradient-to-r hover:from-soft-oat/50 hover:to-fresh-leaf/10"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl p-2.5"
                  >
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
