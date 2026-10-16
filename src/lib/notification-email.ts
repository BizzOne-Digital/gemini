import { getSiteSettings } from "@/lib/data";

const DEFAULT_ADMIN_EMAIL = "homestylewaterloo@gmail.com";

export function adminEmailFromEnv(): string {
  return (
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    DEFAULT_ADMIN_EMAIL
  );
}

/** Prefer site settings notification email, then env, then default inbox. */
export async function resolveAdminNotificationEmail(): Promise<string> {
  try {
    const settings = await getSiteSettings();
    const fromSettings = settings.notificationEmail?.trim();
    if (fromSettings) return fromSettings;
  } catch {
    // fall through to env
  }
  return adminEmailFromEnv();
}
