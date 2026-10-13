import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { resolveImageSrc } from "@/lib/resolve-image";

export const DEFAULT_LOGO = "/images/logo.png";

interface LogoProps {
  className?: string;
  variant?: "default" | "compact" | "footer";
  src?: string;
  alt?: string;
}

export function Logo({
  className,
  variant = "default",
  src = DEFAULT_LOGO,
  alt = "Homestyle Diner",
}: LogoProps) {
  const heights = {
    default: { h: 56, className: "h-10 w-auto max-w-[130px] sm:h-12 sm:max-w-[160px] lg:h-14" },
    compact: { h: 48, className: "h-9 w-auto max-w-[120px]" },
    footer: { h: 64, className: "h-12 w-auto max-w-[160px] sm:h-14" },
  };

  const size = heights[variant];

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex shrink-0 transition-opacity hover:opacity-90",
        variant === "footer" && "rounded-xl bg-white p-2.5 shadow-soft",
        className
      )}
    >
      <Image
        src={resolveImageSrc(src, DEFAULT_LOGO)}
        alt={alt}
        width={180}
        height={size.h}
        className={cn(size.className, "object-contain object-left")}
        priority={variant === "default"}
      />
    </Link>
  );
}
