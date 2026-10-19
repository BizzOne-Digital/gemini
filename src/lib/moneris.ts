/**
 * Moneris Checkout (Classic Gateway store_id + api_token + checkout_id).
 * @see https://developer.moneris.com/Documentation/NA/E-Commerce%20Solutions/Moneris%20Checkout
 */

export type MonerisEnv = "qa" | "prod";

/** Live Classic Gateway store IDs (e.g. gwca082325) must use prod, not gatewayt. */
export function resolveMonerisEnv(): MonerisEnv {
  const raw = process.env.MONERIS_ENV?.trim().toLowerCase();
  if (raw === "prod" || raw === "production" || raw === "live") return "prod";
  if (raw === "qa" || raw === "test" || raw === "sandbox") return "qa";

  const storeId = process.env.MONERIS_STORE_ID?.trim() ?? "";
  if (/^gwca/i.test(storeId)) return "prod";

  return "qa";
}

export function getMonerisConfig() {
  const env = resolveMonerisEnv();
  const storeId = process.env.MONERIS_STORE_ID?.trim();
  const apiToken = process.env.MONERIS_API_TOKEN?.trim();
  const checkoutId = process.env.MONERIS_CHECKOUT_ID?.trim();
  const descriptor =
    process.env.MONERIS_DYNAMIC_DESCRIPTOR?.trim() || "Homestyle Diner";

  return { env, storeId, apiToken, checkoutId, descriptor };
}

export function monerisGatewayBase(env: MonerisEnv): string {
  return env === "prod"
    ? "https://gateway.moneris.com"
    : "https://gatewayt.moneris.com";
}

export function monerisCheckoutUrl(env: MonerisEnv, ticket: string): string {
  const base = monerisGatewayBase(env);
  return `${base}/chkt/index.php?tck=${encodeURIComponent(ticket)}`;
}

export function isMonerisConfigured(): boolean {
  const { storeId, apiToken, checkoutId } = getMonerisConfig();
  return Boolean(storeId && apiToken && checkoutId);
}

type TicketResponse = {
  response?: {
    success?: string | boolean;
    ticket?: string;
    error?: Record<string, unknown> | string;
  };
};

function collectMonerisErrorParts(value: unknown, prefix = ""): string[] {
  if (value == null) return [];
  if (typeof value === "string") {
    return [prefix ? `${prefix}: ${value}` : value];
  }
  if (typeof value !== "object") return [];
  const obj = value as Record<string, unknown>;
  if (typeof obj.message === "string" && obj.message) {
    const msg = obj.message;
    return [prefix ? `${prefix}: ${msg}` : msg];
  }
  if (typeof obj.data === "string" && obj.data) {
    return [prefix ? `${prefix}: ${obj.data}` : obj.data];
  }
  const parts: string[] = [];
  for (const [key, nested] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    parts.push(...collectMonerisErrorParts(nested, path));
  }
  return parts;
}

function formatMonerisError(
  error: Record<string, unknown> | string | undefined
): string {
  if (!error) return "Unable to start Moneris Checkout session.";
  const parts =
    typeof error === "string"
      ? collectMonerisErrorParts(error)
      : collectMonerisErrorParts(error);
  const joined = parts.join("; ");
  return joined
    ? monerisErrorHint(joined)
    : "Unable to start Moneris Checkout session.";
}

function monerisErrorHint(message: string): string {
  if (/invalid data/i.test(message)) {
    return (
      "Moneris rejected the payment session (invalid data). " +
      "For live store credentials, set MONERIS_ENV=prod in Vercel and redeploy."
    );
  }
  return message;
}

const CA_PROVINCE: Record<string, string> = {
  alberta: "AB",
  "british columbia": "BC",
  manitoba: "MB",
  "new brunswick": "NB",
  "newfoundland and labrador": "NL",
  "nova scotia": "NS",
  ontario: "ON",
  "prince edward island": "PE",
  quebec: "QC",
  saskatchewan: "SK",
  "northwest territories": "NT",
  nunavut: "NU",
  yukon: "YT",
};

export function normalizeCanadianProvince(value: string): string {
  const trimmed = value.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return CA_PROVINCE[trimmed.toLowerCase()] ?? trimmed.slice(0, 2).toUpperCase();
}

export function normalizeCanadianPostalCode(value: string): string {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(compact)) {
    return `${compact.slice(0, 3)} ${compact.slice(3)}`;
  }
  return value.trim().toUpperCase();
}

export function isValidCanadianPostalCode(value: string): boolean {
  const normalized = normalizeCanadianPostalCode(value);
  return /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(normalized);
}

export type MonerisBillingDetails = {
  address_1: string;
  city: string;
  province: string;
  country: string;
  postal_code: string;
  address_2?: string;
};

export async function requestMonerisCheckoutTicket(params: {
  orderNumber: string;
  total: number;
  customerEmail?: string;
  customerName?: string;
  billingDetails: MonerisBillingDetails;
  siteUrl: string;
}): Promise<{ ticket: string }> {
  const { env, storeId, apiToken, checkoutId, descriptor } =
    getMonerisConfig();

  if (!storeId || !apiToken || !checkoutId) {
    throw new Error(
      "Moneris is not configured. Set MONERIS_STORE_ID, MONERIS_API_TOKEN, and MONERIS_CHECKOUT_ID."
    );
  }

  const base = monerisGatewayBase(env);
  const environment = env === "prod" ? "prod" : "qa";
  const orderNo = params.orderNumber.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 50);
  const payload: Record<string, unknown> = {
    store_id: storeId,
    api_token: apiToken,
    checkout_id: checkoutId,
    txn_total: params.total.toFixed(2),
    environment,
    action: "preload",
    order_no: orderNo || params.orderNumber,
    cust_id: (params.customerEmail || "guest").slice(0, 50),
    dynamic_descriptor: descriptor.slice(0, 25),
    language: "en",
  };
  payload.billing_details = {
    ...params.billingDetails,
    province: normalizeCanadianProvince(params.billingDetails.province),
    postal_code: normalizeCanadianPostalCode(params.billingDetails.postal_code),
    country: params.billingDetails.country.toUpperCase().slice(0, 2) || "CA",
  };
  if (params.customerEmail || params.customerName) {
    const name = (params.customerName || "").trim();
    const space = name.indexOf(" ");
    payload.contact_details = {
      ...(space > 0
        ? { first_name: name.slice(0, space), last_name: name.slice(space + 1) }
        : name
          ? { first_name: name }
          : {}),
      ...(params.customerEmail ? { email: params.customerEmail } : {}),
    };
  }

  const res = await fetch(`${base}/chkt/request/request.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let parsed: TicketResponse;
  try {
    parsed = JSON.parse(text) as TicketResponse;
  } catch {
    throw new Error(`Moneris ticket request failed: ${text.slice(0, 200)}`);
  }

  const success = parsed.response?.success;
  const ok = success === "true" || success === true;
  const ticket = parsed.response?.ticket;
  if (!ticket || !ok) {
    console.error("Moneris preload failed", {
      env: environment,
      success,
      error: parsed.response?.error,
    });
    throw new Error(formatMonerisError(parsed.response?.error));
  }

  return { ticket };
}
