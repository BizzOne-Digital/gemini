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
    error?: { message?: string };
  };
};

export async function requestMonerisCheckoutTicket(params: {
  orderNumber: string;
  total: number;
  customerEmail?: string;
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
  const body = new URLSearchParams({
    store_id: storeId,
    api_token: apiToken,
    checkout_id: checkoutId,
    txn_total: params.total.toFixed(2),
    order_no: params.orderNumber,
    cust_id: params.customerEmail || "",
    dynamic_descriptor: descriptor,
    language: "en",
    ask_cvv: "Y",
    email: params.customerEmail || "",
    cancel_url: `${params.siteUrl}/order/cancel`,
    return_url: `${params.siteUrl}/order/success`,
  });

  const res = await fetch(`${base}/chkt/request/ticket.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
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
    const msg =
      parsed.response?.error?.message ||
      "Unable to start Moneris Checkout session.";
    throw new Error(msg);
  }

  return { ticket };
}
