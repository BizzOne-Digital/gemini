import type { SiteSettingsData } from "@/types/site";

/** Restaurant Login / Square online ordering (pickup + delivery). */
export const RESTAURANT_LOGIN_ORDER_URL =
  "https://www.restaurantlogin.com/ordering/restaurant/menu?company_uid=f5077a18-3159-4ce0-9ec1-64e233bf85d6&restaurant_uid=f211a691-397f-4cc8-85d7-bd5ae174bf14&facebook=true";

export function externalOrderUrl(
  settings: Pick<SiteSettingsData, "orderOnlineUrl">
): string {
  return settings.orderOnlineUrl?.trim() || RESTAURANT_LOGIN_ORDER_URL;
}

export function useNativeCartCheckout(
  settings: Pick<SiteSettingsData, "onlineOrderingEnabled">
): boolean {
  return !!settings.onlineOrderingEnabled;
}

export function useExternalOnlineOrdering(
  settings: Pick<
    SiteSettingsData,
    "onlineOrderingEnabled" | "orderOnlineUrl"
  >
): boolean {
  return !settings.onlineOrderingEnabled;
}
