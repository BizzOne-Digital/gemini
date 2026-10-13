"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarCheck, Loader2 } from "lucide-react";
import { bookingSchema, type BookingFormData } from "@/lib/validations/forms";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const requestTypeOptions = [
  { value: "table", label: "Table Reservation" },
  { value: "group_dining", label: "Group Dining" },
  { value: "catering", label: "Catering" },
  { value: "business_lunch", label: "Business Lunch" },
  { value: "special_event", label: "Special Event" },
];

interface BookingFormProps {
  bookingEnabled?: boolean;
}

export function BookingForm({ bookingEnabled = true }: BookingFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { numberOfGuests: 2 },
  });

  const requestType = useWatch({ control, name: "requestType" });

  if (!bookingEnabled) {
    return (
      <p className="rounded-xl bg-soft-oat p-6 text-muted-foreground">
        Online booking is temporarily unavailable. Please call us to make a
        reservation.
      </p>
    );
  }

  async function onSubmit(data: BookingFormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Something went wrong. Please try again.");
        return;
      }

      setReferenceNumber(result.referenceNumber);
      toast.success("Booking request received!");
      reset();
    } catch {
      toast.error("Unable to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (referenceNumber) {
    return (
      <div className="rounded-2xl border border-fresh-leaf/30 bg-soft-oat/50 p-8 text-center">
        <CalendarCheck className="mx-auto h-12 w-12 text-heritage-green" />
        <h3 className="mt-4 font-display text-2xl text-espresso">
          Request Received
        </h3>
        <p className="mt-2 text-muted-foreground">
          Your reference number is{" "}
          <strong className="text-espresso">{referenceNumber}</strong>. We will
          confirm your booking shortly.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setReferenceNumber(null)}
        >
          Submit Another Request
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

      <Select
        label="Request Type"
        required
        options={requestTypeOptions}
        placeholder="Select request type"
        {...register("requestType")}
        error={errors.requestType?.message}
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
          required
          {...register("phone")}
          error={errors.phone?.message}
        />
        <Input
          label="Number of Guests"
          type="number"
          min={1}
          max={500}
          required
          {...register("numberOfGuests")}
          error={errors.numberOfGuests?.message}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Preferred Date"
          type="date"
          required
          {...register("preferredDate")}
          error={errors.preferredDate?.message}
        />
        <Input
          label="Preferred Time"
          type="time"
          required
          {...register("preferredTime")}
          error={errors.preferredTime?.message}
        />
      </div>

      {(requestType === "special_event" ||
        requestType === "business_lunch") && (
        <Input
          label="Occasion"
          {...register("occasion")}
          error={errors.occasion?.message}
        />
      )}

      {requestType === "business_lunch" && (
        <Input
          label="Company Name"
          {...register("companyName")}
          error={errors.companyName?.message}
        />
      )}

      <Textarea
        label="Dietary Notes"
        {...register("dietaryNotes")}
        hint="Optional — let us know about allergies or dietary preferences"
      />

      <Textarea
        label="Additional Message"
        {...register("additionalMessage")}
        hint="Optional"
      />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register("consent")}
          className="mt-1 h-4 w-4 rounded border-border text-heritage-green focus:ring-fresh-leaf"
        />
        <span className="text-sm text-muted-foreground">
          I consent to Homestyle Diner processing my booking request.{" "}
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
          <CalendarCheck className="h-5 w-5" />
        )}
        Submit Booking Request
      </Button>
    </form>
  );
}
