import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContactInquiry from "@/models/ContactInquiry";
import { contactSchema } from "@/lib/validations/forms";
import { rateLimit } from "@/lib/rate-limit";
import {
  sendEmail,
  contactConfirmationEmail,
  contactAdminNotification,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`contact-${ip}`, 3, 60_000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    if (body.honeypot) {
      return NextResponse.json({ success: true });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const inquiry = await ContactInquiry.create({
      ...parsed.data,
      status: "new",
    });

    const emailData = {
      Name: parsed.data.fullName,
      Email: parsed.data.email,
      Phone: parsed.data.phone || "N/A",
      Reason: parsed.data.reason,
      Message: parsed.data.message,
    };

    await Promise.all([
      sendEmail({
        to: parsed.data.email,
        subject: "We received your message - Homestyle Diner",
        html: contactConfirmationEmail(parsed.data.fullName),
      }),
      sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || "",
        subject: `New Contact Inquiry from ${parsed.data.fullName}`,
        html: contactAdminNotification(emailData),
      }),
    ]);

    return NextResponse.json({ success: true, id: inquiry._id });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
