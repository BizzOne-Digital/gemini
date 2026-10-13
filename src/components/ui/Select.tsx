import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, options, placeholder, className, id, ...props },
    ref
  ) {
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
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "flex h-11 w-full appearance-none rounded-xl border border-border bg-white px-4 pr-10 text-sm text-charcoal shadow-sm transition-colors",
              "focus:border-fresh-leaf focus:outline-none focus:ring-2 focus:ring-fresh-leaf/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-warm-terracotta",
              className
            )}
            aria-invalid={!!error}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
        {error && (
          <p className="text-xs text-warm-terracotta" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
