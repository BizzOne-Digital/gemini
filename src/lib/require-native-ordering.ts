import { redirect } from "next/navigation";
import { getSiteSettings } from "@/lib/data";
import {
  externalOrderUrl,
  useNativeCartCheckout,
} from "@/lib/external-ordering";

/** Redirect to Restaurant Login when built-in cart checkout is disabled. */
export async function requireNativeOnlineOrdering() {
  const settings = await getSiteSettings();
  if (!useNativeCartCheckout(settings)) {
    redirect(externalOrderUrl(settings));
  }
}
