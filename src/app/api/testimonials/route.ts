import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { testimonialSchema } from "@/lib/validations/forms";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`testimonial-${ip}`, 2, 60_000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    if (body.honeypot) return NextResponse.json({ success: true });

    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    await Testimonial.create({
      customerName: parsed.data.customerName,
      rating: parsed.data.rating,
      reviewText: parsed.data.reviewText,
      visitType: parsed.data.visitType,
      status: "pending",
    });

    await sendEmail({
      to: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || "",
      subject: `New Testimonial Submission from ${parsed.data.customerName}`,
      html: `<h2>New Testimonial (Pending Approval)</h2>
        <p><strong>${parsed.data.customerName}</strong> - ${parsed.data.rating}/5</p>
        <p>${parsed.data.reviewText}</p>`,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review is pending approval.",
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const testimonials = await Testimonial.find({ status: "approved" })
      .sort({ reviewDate: -1 })
      .limit(50);
    return NextResponse.json(testimonials);
  } catch {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
