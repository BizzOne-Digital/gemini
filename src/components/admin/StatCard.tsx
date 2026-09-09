import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "green" | "gold" | "default";
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, variant = "green", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-5 text-white shadow-soft",
        variant === "green" && "gradient-green",
        variant === "gold" && "gradient-gold text-espresso",
        variant === "default" && "bg-white text-foreground border border-border",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : variant === "gold" ? "text-espresso/70" : "text-white/80"
            )}
          >
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs",
                variant === "default" ? "text-muted-foreground" : variant === "gold" ? "text-espresso/60" : "text-white/70"
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            variant === "default" ? "bg-primary/10 text-primary" : "bg-white/20"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
