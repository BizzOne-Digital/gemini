"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { externalOrderUrl } from "@/lib/external-ordering";
import { cn } from "@/lib/utils";

type Props = {
  onlineOrderingEnabled: boolean;
  orderOnlineUrl?: string;
  className?: string;
  mobile?: boolean;
};

export function OrderNavLinks({
  onlineOrderingEnabled,
  orderOnlineUrl,
  className,
  mobile,
}: Props) {
  const { itemCount } = useCart();

  if (onlineOrderingEnabled) {
    return (
      <Link
        href="/order/cart"
        className={cn(
          mobile
            ? "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-heritage-green text-sm font-semibold uppercase tracking-wider text-warm-cream"
            : "inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-deep-forest via-heritage-green to-fresh-leaf px-5 text-xs font-semibold uppercase tracking-wider text-warm-cream shadow-soft transition-all hover:brightness-110 hover:shadow-elevated glow-green",
          className
        )}
      >
        <ShoppingCart className="h-4 w-4" />
        Order online
        {itemCount > 0 && (
          <span className="rounded-full bg-warm-cream px-2 py-0.5 text-[0.65rem] font-bold text-heritage-green">
            {itemCount}
          </span>
        )}
      </Link>
    );
  }

  const orderHref = externalOrderUrl({ orderOnlineUrl });

  return (
    <Link
      href={orderHref}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        mobile
          ? "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-heritage-green text-sm font-semibold uppercase tracking-wider text-warm-cream"
          : "inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-deep-forest via-heritage-green to-fresh-leaf px-5 text-xs font-semibold uppercase tracking-wider text-warm-cream shadow-soft transition-all hover:brightness-110 hover:shadow-elevated glow-green",
        className
      )}
    >
      <ShoppingCart className="h-4 w-4" />
      Order Online
    </Link>
  );
}
