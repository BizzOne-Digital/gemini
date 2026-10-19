import "./load-env";
import {
  getMonerisConfig,
  isMonerisConfigured,
  requestMonerisCheckoutTicket,
} from "../src/lib/moneris";

async function main() {
  const cfg = getMonerisConfig();
  console.log("Moneris configuration check");
  console.log("  MONERIS_ENV:", cfg.env);
  console.log("  Store ID:", cfg.storeId ? `${cfg.storeId.slice(0, 4)}…` : "(missing)");
  console.log("  API token:", cfg.apiToken ? "set" : "(missing)");
  console.log("  Checkout ID:", cfg.checkoutId || "(missing — required)");
  console.log("  Descriptor:", cfg.descriptor);
  console.log("  isMonerisConfigured():", isMonerisConfigured());

  if (!cfg.storeId || !cfg.apiToken) {
    console.log("\nResult: NOT READY — store ID and API token required.");
    process.exit(1);
  }

  if (!cfg.checkoutId) {
    console.log(
      "\nResult: INCOMPLETE — code is wired correctly, but checkout will return 503 until MONERIS_CHECKOUT_ID is set in Moneris Admin → Moneris Checkout."
    );
    process.exit(2);
  }

  for (const env of ["qa", "prod"] as const) {
    process.env.MONERIS_ENV = env;
    try {
      const { ticket } = await requestMonerisCheckoutTicket({
        orderNumber: `TEST-${Date.now()}`,
        total: 1.0,
        customerEmail: "test@example.com",
        customerName: "Test Customer",
        billingDetails: {
          address_1: "504 Albert St",
          city: "Waterloo",
          province: "ON",
          country: "CA",
          postal_code: "N2L 3V4",
        },
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      });
      console.log(`\nResult: OK on ${env} — ticket received (${ticket.slice(0, 8)}…)`);
      process.exit(0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`\n  ${env} gateway ticket test failed: ${msg}`);
    }
  }

  console.log(
    "\nResult: FAILED — credentials or checkout ID may be for the other environment (try MONERIS_ENV=prod if this is a live store)."
  );
  process.exit(1);
}

main();
