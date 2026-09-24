import { Clock, MapPin, Phone, Utensils } from "lucide-react";
import { formatPhone } from "@/lib/utils";
import type { SiteSettingsData } from "@/types/site";
import { getFullAddress, getPhoneHref, getTodayHoursLine } from "@/types/site";
import { FadeIn } from "@/components/public/animations/FadeIn";

interface QuickInfoStripProps {
  settings: SiteSettingsData;
}

const cellClassName =
  "flex shrink-0 items-center gap-2.5 rounded-xl p-2.5 sm:gap-3 sm:p-3";

const lineClassName =
  "whitespace-nowrap text-[13px] font-semibold leading-none text-charcoal sm:text-sm";

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className={lineClassName}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-espresso sm:text-xs">
        {label}
      </span>
      <span className="mx-1.5 text-espresso/35" aria-hidden>
        ·
      </span>
      <span>{value}</span>
    </p>
  );
}

export function QuickInfoStrip({ settings }: QuickInfoStripProps) {
  const hours = settings.businessHours?.length ? settings.businessHours : [];
  const fullAddress = getFullAddress(settings);
  const hoursLine = hours.length ? getTodayHoursLine(hours) : "See hours below";

  const items = [
    {
      key: "hours",
      icon: Clock,
      content: <InfoLine label="Today's Hours" value={hoursLine} />,
    },
    {
      key: "visit",
      icon: MapPin,
      content: <InfoLine label="Visit Us" value={fullAddress} />,
      href:
        settings.directionsUrl ||
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`,
    },
    {
      key: "call",
      icon: Phone,
      content: <InfoLine label="Call Us" value={formatPhone(settings.phone)} />,
      href: getPhoneHref(settings.phone),
    },
    {
      key: "dine",
      icon: Utensils,
      content: (
        <InfoLine
          label="Dine-In & Takeout"
          value="Breakfast, lunch & dinner made from scratch"
        />
      ),
    },
  ];

  return (
    <section className="section-safe relative z-10 -mt-6 pb-4 sm:-mt-8">
      <div className="container-diner">
        <FadeIn>
          <div className="gradient-border glow-green rounded-2xl shadow-elevated">
            <div className="overflow-x-auto overscroll-x-contain bg-gradient-to-br from-white via-warm-cream to-soft-oat/60 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max min-w-full flex-nowrap items-center gap-1 p-2 sm:gap-2 sm:p-3 lg:justify-between lg:gap-3 lg:p-4 xl:w-full xl:justify-between">
                {items.map((item) => {
                  const Icon = item.icon;
                  const inner = (
                    <>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-heritage-green/15 to-fresh-leaf/20 text-heritage-green sm:h-10 sm:w-10">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      {item.content}
                    </>
                  );

                  if (item.href) {
                    return (
                      <a
                        key={item.key}
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          item.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className={`${cellClassName} transition-all hover:bg-gradient-to-r hover:from-soft-oat/50 hover:to-fresh-leaf/10`}
                      >
                        {inner}
                      </a>
                    );
                  }

                  return (
                    <div key={item.key} className={cellClassName}>
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
