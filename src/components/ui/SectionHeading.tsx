import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  titleAs?: "h1" | "h2" | "h3";
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleAs: TitleTag = "h2",
  light = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-sm font-semibold uppercase tracking-[0.2em]",
            light ? "text-butter-gold" : "text-gradient-green"
          )}
        >
          {eyebrow}
        </p>
      )}
      <TitleTag
        className={cn(
          "font-display text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]",
          light ? "text-warm-cream" : "text-gradient-green"
        )}
      >
        {title}
      </TitleTag>
      {align === "center" ? (
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-fresh-leaf via-butter-gold to-warm-terracotta opacity-70" />
      ) : (
        <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-fresh-leaf to-butter-gold opacity-70" />
      )}
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            light ? "text-warm-cream/80" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
