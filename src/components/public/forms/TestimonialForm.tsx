"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";
import { testimonialSchema, type TestimonialFormData } from "@/lib/validations/forms";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const visitTypeOptions = [
  { value: "dine_in", label: "Dine-In" },
  { value: "takeout", label: "Takeout" },
  { value: "catering", label: "Catering" },
  { value: "group_dining", label: "Group Dining" },
  { value: "other", label: "Other" },
];

export function TestimonialForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: { rating: 5 },
  });

  const rating = useWatch({ control, name: "rating" });

  async function onSubmit(data: TestimonialFormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Something went wrong. Please try again.");
        return;
      }

      toast.success(result.message || "Thank you for your review!");
      setSubmitted(true);
      reset();
    } catch {
      toast.error("Unable to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-fresh-leaf/30 bg-soft-oat/50 p-8 text-center">
        <Star className="mx-auto h-12 w-12 fill-butter-gold text-butter-gold" />
        <h3 className="mt-4 font-display text-2xl text-espresso">
          Thank You!
        </h3>
        <p className="mt-2 text-muted-foreground">
          Your review has been submitted and is pending approval before it
          appears on our website.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          Submit Another Review
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input
        type="text"
        {...register("honeypot")}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      <Input
        label="Your Name"
        required
        {...register("customerName")}
        error={errors.customerName?.message}
      />

      <div>
        <label className="block text-sm font-medium text-espresso mb-2">
          Rating <span className="text-warm-terracotta">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setValue("rating", star, { shouldValidate: true })}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hoverRating || rating) >= star
                    ? "fill-butter-gold text-butter-gold"
                    : "text-soft-oat"
                )}
              />
            </button>
          ))}
        </div>
        <input type="hidden" {...register("rating")} />
        {errors.rating && (
          <p className="mt-1 text-xs text-warm-terracotta">
            {errors.rating.message}
          </p>
        )}
      </div>

      <Textarea
        label="Your Review"
        required
        rows={5}
        {...register("reviewText")}
        error={errors.reviewText?.message}
        hint="Share your experience — minimum 20 characters"
      />

      <Select
        label="Visit Type"
        options={visitTypeOptions}
        placeholder="How did you visit us?"
        {...register("visitType")}
      />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register("consent")}
          className="mt-1 h-4 w-4 rounded border-border text-heritage-green focus:ring-fresh-leaf"
        />
        <span className="text-sm text-muted-foreground">
          I consent to Homestyle Diner publishing my review after approval.{" "}
          <span className="text-warm-terracotta">*</span>
        </span>
      </label>
      {errors.consent && (
        <p className="text-xs text-warm-terracotta">{errors.consent.message}</p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={submitting}>
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Star className="h-5 w-5" />
        )}
        Submit Review
      </Button>
    </form>
  );
}
