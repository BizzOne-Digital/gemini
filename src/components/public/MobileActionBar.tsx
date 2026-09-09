"use client";

import { Phone, MapPin, ShoppingBag } from "lucide-react";
import { formatPhone } from "@/lib/utils";
import type { SiteSettingsData } from "@/types/site";
import { getFullAddress, getPhoneHref } from "@/types/site";

interface MobileActionBarProps {
  settings: SiteSettingsData;
}

export function MobileActionBar({ settings }: MobileActionBarProps) {
  const directionsUrl =
    settings.directionsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getFullAddress(settings))}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 w-full max-w-[100vw] border-t border-heritage-green/15 bg-gradient-to-t from-warm-cream via-white/95 to-soft-oat/80 backdrop-blur-md shadow-elevated md:hidden">
      <div className="grid grid-cols-3 divide-x divide-border/60">
        <a
          href={getPhoneHref(settings.phone)}
          className="flex flex-col items-center gap-1 py-3 text-espresso transition-colors active:bg-soft-oat"
        >
          <Phone className="h-5 w-5 text-heritage-green" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide">
            Call
          </span>
        </a>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-3 text-espresso transition-colors active:bg-soft-oat"
        >
          <MapPin className="h-5 w-5 text-heritage-green" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide">
            Directions
          </span>
        </a>
        <a
          href={settings.orderOnlineUrl || "/menu"}
          target={settings.orderOnlineUrl ? "_blank" : undefined}
          rel={settings.orderOnlineUrl ? "noopener noreferrer" : undefined}
          className="flex flex-col items-center gap-1 py-3 text-espresso transition-colors active:bg-soft-oat"
        >
          <ShoppingBag className="h-5 w-5 text-heritage-green" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide">
            {settings.orderOnlineUrl ? "Order" : "Menu"}
          </span>
        </a>
      </div>
      <div className="sr-only">
        Call {formatPhone(settings.phone)} or get directions to{" "}
        {getFullAddress(settings)}
      </div>
    </div>
  );
}
