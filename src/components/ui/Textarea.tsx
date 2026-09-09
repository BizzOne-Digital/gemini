import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, ...props }, ref) {
    const inputId = id || props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-espresso"
          >
            {label}
            {props.required && <span className="text-warm-terracotta ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-charcoal shadow-sm transition-colors resize-y",
            "placeholder:text-muted-foreground/60",
            "focus:border-fresh-leaf focus:outline-none focus:ring-2 focus:ring-fresh-leaf/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-warm-terracotta focus:border-warm-terracotta focus:ring-warm-terracotta/20",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-warm-terracotta" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
