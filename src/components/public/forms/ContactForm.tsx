"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { contactSchema, type ContactFormData } from "@/lib/validations/forms";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const reasonOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "menu", label: "Menu Question" },
  { value: "catering", label: "Catering" },
  { value: "group_dining", label: "Group Dining" },
  { value: "accessibility", label: "Accessibility" },
  { value: "feedback", label: "Feedback" },
  { value: "business", label: "Business Inquiry" },
  { value: "other", label: "Other" },
];

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { consent: undefined },
  });

  async function onSubmit(data: ContactFormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Something went wrong. Please try again.");
        return;
      }

      toast.success("Message sent! We'll get back to you soon.");
      reset();
    } catch {
      toast.error("Unable to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Full Name"
          required
          {...register("fullName")}
          error={errors.fullName?.message}
        />
        <Input
          label="Email"
          type="email"
          required
          {...register("email")}
          error={errors.email?.message}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Phone"
          type="tel"
          {...register("phone")}
          error={errors.phone?.message}
          hint="Optional"
        />
        <Select
          label="Reason for Contact"
          required
          options={reasonOptions}
          placeholder="Select a reason"
          {...register("reason")}
          error={errors.reason?.message}
        />
      </div>

      <Textarea
        label="Message"
        required
        rows={5}
        {...register("message")}
        error={errors.message?.message}
      />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register("consent")}
          className="mt-1 h-4 w-4 rounded border-border text-heritage-green focus:ring-fresh-leaf"
        />
        <span className="text-sm text-muted-foreground">
          I consent to Homestyle Diner contacting me regarding my inquiry.{" "}
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
          <Send className="h-5 w-5" />
        )}
        Send Message
      </Button>
    </form>
  );
}
