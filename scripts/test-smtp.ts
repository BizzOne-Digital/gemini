import "./load-env";
import { sendEmail } from "../src/lib/email";

async function main() {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  if (!to) {
    console.log("Set ADMIN_NOTIFICATION_EMAIL or SMTP_USER.");
    process.exit(1);
  }
  const result = await sendEmail({
    to,
    subject: "Homestyle — notification test",
    html: "<p>SMTP is working. Contact and booking alerts will be delivered to this inbox.</p>",
  });
  console.log(result.success ? "OK — test email sent." : "FAILED", result);
  process.exit(result.success ? 0 : 1);
}

main();
