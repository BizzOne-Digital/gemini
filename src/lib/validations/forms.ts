import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  reason: z.enum([
    "general",
    "menu",
    "catering",
    "group_dining",
    "accessibility",
    "feedback",
    "business",
    "other",
  ]),
  message: z.string().min(10, "Message must be at least 10 characters"),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
  honeypot: z.string().max(0).optional(),
});

export const bookingSchema = z.object({
  requestType: z.enum([
    "table",
    "group_dining",
    "catering",
    "business_lunch",
    "special_event",
  ]),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10, "Please enter a valid phone number"),
  preferredDate: z.string().min(1, "Date is required"),
  preferredTime: z.string().min(1, "Time is required"),
  numberOfGuests: z.coerce.number().min(1).max(500),
  occasion: z.string().optional(),
  companyName: z.string().optional(),
  dietaryNotes: z.string().optional(),
  additionalMessage: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
  honeypot: z.string().max(0).optional(),
});

export const testimonialSchema = z.object({
  customerName: z.string().min(2),
  rating: z.coerce.number().min(1).max(5),
  reviewText: z.string().min(20, "Review must be at least 20 characters"),
  visitType: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
  honeypot: z.string().max(0).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type TestimonialFormData = z.infer<typeof testimonialSchema>;
