import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Share2,
  ExternalLink,
} from "lucide-react";
import { formatPhone } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/public/Logo";
import type { NavigationData, SiteSettingsData } from "@/types/site";
import {
  formatHoursSummary,
  getFullAddress,
  getPhoneHref,
} from "@/types/site";

interface FooterProps {
  navigation: NavigationData;
  settings: SiteSettingsData;
}

export function Footer({ navigation, settings }: FooterProps) {
  const visibleLinks = navigation.links
    .filter((l) => l.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const hours = settings.businessHours?.length
    ? settings.businessHours
    : [];
  const hoursSummary = hours.length
    ? formatHoursSummary(hours)
    : "Mon–Sun 9:00 AM–7:00 PM";

  return (
    <footer className="section-safe relative overflow-hidden gradient-green-mesh text-warm-cream">
      <div className="section-divider-gradient" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-forest/80 via-transparent to-butter-gold/5"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="footer-pattern"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="30" cy="30" r="1.5" fill="currentColor" />
              <path
                d="M0 30h60M30 0v60"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-pattern)" />
        </svg>
      </div>

      <div className="container-diner relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo
              variant="footer"
              src={settings.logos?.footer || settings.logos?.main || undefined}
              alt={settings.logos?.altText || "Homestyle Diner"}
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-warm-cream/75">
              {settings.footerDescription}
            </p>
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-butter-gold transition-colors hover:text-warm-cream"
              >
                <Share2 className="h-4 w-4" />
                Follow us on Facebook
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-butter-gold">
              Explore
            </h3>
            <ul className="mt-4 space-y-2">
              {visibleLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-cream/75 transition-colors hover:text-warm-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-warm-cream/75 transition-colors hover:text-warm-cream"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-butter-gold">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={getPhoneHref(settings.phone)}
                  className="flex items-start gap-3 text-sm text-warm-cream/75 transition-colors hover:text-warm-cream"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-fresh-leaf" />
                  {formatPhone(settings.phone)}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.primaryEmail}`}
                  className="flex items-start gap-3 text-sm text-warm-cream/75 transition-colors hover:text-warm-cream"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-fresh-leaf" />
                  {settings.primaryEmail}
                </a>
              </li>
              <li>
                <a
                  href={
                    settings.directionsUrl ||
                    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getFullAddress(settings))}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-warm-cream/75 transition-colors hover:text-warm-cream"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fresh-leaf" />
                  {getFullAddress(settings)}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-butter-gold">
              Hours
            </h3>
            <div className="mt-4 flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-fresh-leaf" />
              <div>
                <p className="text-sm text-warm-cream/75">{hoursSummary}</p>
                {settings.parkingNotes && (
                  <p className="mt-3 text-xs text-warm-cream/55">
                    {settings.parkingNotes}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button href="/booking" variant="secondary" size="sm">
                Book a Table
              </Button>
              <Button
                href="/contact"
                variant="outline"
                size="sm"
                className="border-warm-cream/30 text-warm-cream hover:bg-white/10"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-warm-cream/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-words text-xs leading-relaxed text-warm-cream/50">
            © {new Date().getFullYear()} {settings.legalBusinessName}. All
            rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <Link
              href="/privacy-policy"
              className="text-warm-cream/50 transition-colors hover:text-warm-cream"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-warm-cream/50 transition-colors hover:text-warm-cream"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
