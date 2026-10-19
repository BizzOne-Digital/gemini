/**
 * Moneris Checkout (Classic Gateway store_id + api_token + checkout_id).
 * @see https://developer.moneris.com/Documentation/NA/E-Commerce%20Solutions/Moneris%20Checkout
 */

export type MonerisEnv = "qa" | "prod";

export function getMonerisConfig() {
  const env = (process.env.MONERIS_ENV === "prod" ? "prod" : "qa") as MonerisEnv;
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
    success?: string;
    ticket?: string;
    error?: Record<string, unknown>;
  };
};

function formatMonerisError(error: Record<string, unknown> | undefined): string {
  if (!error) return "Unable to start Moneris Checkout session.";
  if (typeof error.message === "string" && error.message) return error.message;
  const parts: string[] = [];
  for (const [key, value] of Object.entries(error)) {
    if (value && typeof value === "object" && "data" in value) {
      const data = (value as { data?: string }).data;
      if (data) parts.push(`${key}: ${data}`);
    } else if (typeof value === "string") {
      parts.push(`${key}: ${value}`);
    }
  }
  return parts.length ? parts.join("; ") : "Unable to start Moneris Checkout session.";
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
  const payload: Record<string, unknown> = {
    store_id: storeId,
    api_token: apiToken,
    checkout_id: checkoutId,
    txn_total: params.total.toFixed(2),
    environment,
    action: "preload",
    order_no: params.orderNumber,
    cust_id: params.customerEmail || "",
    dynamic_descriptor: descriptor,
    language: "en",
  };
  payload.billing_details = params.billingDetails;
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

  const ticket = parsed.response?.ticket;
  if (!ticket || parsed.response?.success !== "true") {
    throw new Error(formatMonerisError(parsed.response?.error));
  }

  return { ticket };
}
