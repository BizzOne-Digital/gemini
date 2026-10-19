export interface MonerisCheckoutEvent {
  response_code?: string;
  ticket?: string;
  order_no?: string;
  txn_id?: string;
  transaction_id?: string;
  [key: string]: unknown;
}

/** Moneris Checkout v2 embed (loaded from gateway chktv2/js/chkt_v3.00.min.js). */
export declare class MonerisCheckoutEmbedApi {
  setMode(mode: "qa" | "prod"): void;
  setCheckoutDiv(elementId: string): void;
  setCallback(
    event:
      | "page_loaded"
      | "cancel_transaction"
      | "error_event"
      | "payment_receipt"
      | "payment_complete",
    handler: (data: MonerisCheckoutEvent) => void
  ): void;
  startCheckout(ticket: string): void;
}

declare global {
  interface Window {
    monerisCheckout?: typeof MonerisCheckoutEmbedApi;
    MonerisCheckout?: typeof MonerisCheckoutEmbedApi;
  }
}

export {};
