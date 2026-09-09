"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, Phone, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/public/Logo";
import type { NavigationData, SiteSettingsData } from "@/types/site";
import { getPhoneHref } from "@/types/site";

interface HeaderProps {
  navigation: NavigationData;
  settings: SiteSettingsData;
}

export function Header({ navigation, settings }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const prefersReducedMotion = useReducedMotion();

  const visibleLinks = navigation.links
    .filter((l) => l.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const orderHref = settings.orderOnlineUrl || "/menu";
  const orderExternal = !!settings.orderOnlineUrl;

  return (
    <>
      <header className="sticky top-0 z-50 w-full max-w-[100vw]">
        {/* Top info bar */}
        <div className="gradient-header-bar text-warm-cream/95">
          <div className="container-diner">
            <p className="flex flex-col items-center gap-0.5 py-2 text-center text-[0.6rem] font-medium uppercase leading-snug tracking-[0.12em] sm:flex-row sm:justify-center sm:gap-0 sm:text-xs sm:tracking-[0.2em]">
              <span>Open Daily 9AM – 7PM</span>
              <span className="hidden opacity-50 sm:mx-2 sm:inline">•</span>
              <span className="text-[0.58rem] sm:text-xs">504 Albert St, Waterloo</span>
            </p>
          </div>
        </div>

        {/* Main header */}
        <div
          className={cn(
            "border-b border-heritage-green/10 bg-gradient-to-b from-warm-cream via-white/95 to-warm-cream/90 backdrop-blur-md transition-shadow",
            !isHome && "shadow-soft"
          )}
        >
          <div className="container-diner">
            <div className="flex h-[4rem] items-center justify-between gap-2 sm:h-[4.5rem] sm:gap-4 lg:h-[5rem]">
              <Logo
                className="shrink-0"
                src={settings.logos?.main || undefined}
                alt={settings.logos?.altText || "Homestyle Diner"}
              />

              <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
                {visibleLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                      className={cn(
                        "relative px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
                        active
                          ? "text-heritage-green"
                          : "text-espresso/80 hover:text-heritage-green"
                      )}
                    >
                      {link.label}
                      {active && (
                        <span
                          className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-heritage-green"
                          aria-hidden
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden items-center gap-2.5 md:flex">
                <Link
                  href={getPhoneHref(settings.phone)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-heritage-green/25 px-4 text-xs font-semibold uppercase tracking-wider text-heritage-green transition-colors hover:border-heritage-green hover:bg-heritage-green/5"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call Now
                </Link>
                <Link
                  href={orderHref}
                  target={orderExternal ? "_blank" : undefined}
                  rel={orderExternal ? "noopener noreferrer" : undefined}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-deep-forest via-heritage-green to-fresh-leaf px-5 text-xs font-semibold uppercase tracking-wider text-warm-cream shadow-soft transition-all hover:brightness-110 hover:shadow-elevated glow-green"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Order Online
                </Link>
              </div>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-espresso transition-colors hover:bg-soft-oat xl:hidden"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-deep-forest/50 backdrop-blur-sm xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            className="fixed inset-y-0 right-0 z-50 w-[min(100%,20rem)] border-l border-heritage-green/10 bg-warm-cream shadow-elevated xl:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Mobile"
          >
        <div className="flex h-full flex-col px-6 pb-8 pt-6">
          <div className="mb-6 flex justify-center">
            <Logo
              variant="compact"
              src={settings.logos?.main || undefined}
              alt={settings.logos?.altText || "Homestyle Diner"}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-3.5 text-sm font-semibold uppercase tracking-wider text-espresso transition-colors hover:bg-soft-oat"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Link
              href={getPhoneHref(settings.phone)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-heritage-green/25 text-sm font-semibold uppercase tracking-wider text-heritage-green"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </Link>
            <Link
              href={orderHref}
              target={orderExternal ? "_blank" : undefined}
              rel={orderExternal ? "noopener noreferrer" : undefined}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-heritage-green text-sm font-semibold uppercase tracking-wider text-warm-cream"
            >
              <ShoppingCart className="h-4 w-4" />
              Order Online
            </Link>
          </div>
        </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
