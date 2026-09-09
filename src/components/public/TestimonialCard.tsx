import { Star } from "lucide-react";
import type { TestimonialData } from "@/types/site";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: TestimonialData;
  featured?: boolean;
}

export function TestimonialCard({
  testimonial,
  featured = false,
}: TestimonialCardProps) {
  return (
    <Card
      className={cn(featured && "border-butter-gold/30 bg-gradient-to-br from-white to-soft-oat/30")}
      hover
    >
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < testimonial.rating
                ? "fill-butter-gold text-butter-gold"
                : "text-soft-oat"
            )}
          />
        ))}
      </div>
      <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{testimonial.reviewText}&rdquo;
      </blockquote>
      <footer className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
        <cite className="not-italic font-semibold text-espresso">
          {testimonial.customerName}
        </cite>
        {testimonial.visitType && (
          <span className="text-xs text-fresh-leaf capitalize">
            {testimonial.visitType.replace(/_/g, " ")}
          </span>
        )}
      </footer>
    </Card>
  );
}
