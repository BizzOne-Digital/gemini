import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BookingRequest from "@/models/BookingRequest";
import { bookingSchema } from "@/lib/validations/forms";
import { rateLimit } from "@/lib/rate-limit";
import { generateReference } from "@/lib/utils";
import {
  sendEmail,
  bookingConfirmationEmail,
  bookingAdminNotification,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`booking-${ip}`, 3, 60_000);
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

    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const referenceNumber = generateReference("BK");

    await connectDB();
    await BookingRequest.create({
      ...parsed.data,
      preferredDate: new Date(parsed.data.preferredDate),
      referenceNumber,
      status: "new",
      statusHistory: [{ status: "new", changedAt: new Date() }],
    });

    const emailData: Record<string, string> = {
      Reference: referenceNumber,
      Type: parsed.data.requestType,
      Name: parsed.data.fullName,
      Email: parsed.data.email,
      Phone: parsed.data.phone,
      Date: parsed.data.preferredDate,
      Time: parsed.data.preferredTime,
      Guests: String(parsed.data.numberOfGuests),
    };
    if (parsed.data.companyName) emailData.Company = parsed.data.companyName;

    await Promise.all([
      sendEmail({
        to: parsed.data.email,
        subject: `Booking Request Received - ${referenceNumber}`,
        html: bookingConfirmationEmail(parsed.data.fullName, referenceNumber),
      }),
      sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || "",
        subject: `New Booking Request - ${referenceNumber}`,
        html: bookingAdminNotification(emailData),
      }),
    ]);

    return NextResponse.json({ success: true, referenceNumber });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
