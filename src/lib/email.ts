import nodemailer from "nodemailer";

const brandColors = {
  forest: "#123B2A",
  cream: "#FFF8E8",
  gold: "#E8B84A",
};

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:${brandColors.cream};font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${brandColors.cream};padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(18,59,42,0.1);">
            <tr><td style="background:linear-gradient(135deg,${brandColors.forest},#1F5B3A);padding:30px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">Homestyle Diner</h1>
              <p style="color:${brandColors.gold};margin:8px 0 0;font-size:14px;">Homemade Comfort Food, Served with Heart</p>
            </td></tr>
            <tr><td style="padding:30px;color:#37251C;line-height:1.6;">${content}</td></tr>
            <tr><td style="padding:20px 30px;background:#F2E5C9;text-align:center;font-size:12px;color:#20251F;">
              Gemini-SR Enterprise Inc. O/A Gemini Homestyle Diner<br>
              504 Albert St, Waterloo, ON N2L 3V4 | 519-725-5048
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: emailWrapper(html),
    });
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error };
  }
}

export function contactConfirmationEmail(name: string) {
  return `<h2>Thank you, ${name}!</h2>
    <p>We have received your message and will get back to you as soon as possible.</p>
    <p>If your inquiry is urgent, please call us at <strong>519-725-5048</strong>.</p>`;
}

export function contactAdminNotification(data: Record<string, string>) {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${k}</td><td style="padding:8px;border-bottom:1px solid #eee;">${v}</td></tr>`)
    .join("");
  return `<h2>New Contact Inquiry</h2><table width="100%">${rows}</table>`;
}

export function bookingConfirmationEmail(name: string, reference: string) {
  return `<h2>Booking Request Received</h2>
    <p>Hi ${name},</p>
    <p>Thank you for your booking request. Your reference number is:</p>
    <p style="font-size:20px;font-weight:bold;color:${brandColors.forest};">${reference}</p>
    <p><strong>Please note:</strong> This is a request only and is not yet confirmed. Our team will contact you shortly to confirm availability.</p>`;
}

export function bookingAdminNotification(data: Record<string, string>) {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${k}</td><td style="padding:8px;border-bottom:1px solid #eee;">${v}</td></tr>`)
    .join("");
  return `<h2>New Booking Request</h2><table width="100%">${rows}</table>`;
}

export function testimonialConfirmationEmail(name: string) {
  return `<h2>Thank you for your review, ${name}!</h2>
    <p>Your testimonial has been submitted and is pending approval. Once approved, it will appear on our website.</p>`;
}
