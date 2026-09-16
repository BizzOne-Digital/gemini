import type { BusinessHours } from "@/types/site";
import { getHoursPerDay, getTodayHoursLine } from "@/types/site";
import { cn } from "@/lib/utils";

interface BusinessHoursDisplayProps {
  hours: BusinessHours[];
  variant?: "list" | "today" | "inline";
  className?: string;
  light?: boolean;
}

export function BusinessHoursDisplay({
  hours,
  variant = "list",
  className,
  light = false,
}: BusinessHoursDisplayProps) {
  if (!hours.length) {
    return (
      <p className={cn("text-sm", light ? "text-warm-cream/75" : "text-muted-foreground", className)}>
        Hours posted at the restaurant.
      </p>
    );
  }

  if (variant === "today") {
    return (
      <p
        className={cn(
          "text-sm font-semibold leading-snug",
          light ? "text-warm-cream" : "text-espresso",
          className
        )}
      >
        {getTodayHoursLine(hours)}
      </p>
    );
  }

  if (variant === "inline") {
    return (
      <p
        className={cn(
          "text-sm leading-relaxed",
          light ? "text-warm-cream/80" : "text-muted-foreground",
          className
        )}
      >
        {getHoursPerDay(hours)
          .map(({ day, line }) => `${day.slice(0, 3)} ${line}`)
          .join(" · ")}
      </p>
    );
  }

  return (
    <ul className={cn("space-y-1.5 text-sm", className)}>
      {getHoursPerDay(hours).map(({ day, line }) => (
        <li
          key={day}
          className={cn(
            "flex justify-between gap-4 border-b border-dashed pb-1.5 last:border-0",
            light ? "border-warm-cream/15 text-warm-cream/85" : "border-border/60 text-muted-foreground"
          )}
        >
          <span className={cn("font-medium", light ? "text-warm-cream" : "text-espresso")}>
            {day}
          </span>
          <span className="text-right">{line}</span>
        </li>
      ))}
    </ul>
  );
}
