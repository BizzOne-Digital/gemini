"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { MonerisEnv } from "@/lib/moneris";
import { monerisCheckoutScriptUrl } from "@/lib/moneris";
import type { MonerisCheckoutEvent } from "@/types/moneris-checkout";

const SESSION_TICKET = "monerisTicket";
const SESSION_MODE = "monerisMode";
const SESSION_ORDER = "pendingOrderNumber";

type Props = {
  mode: MonerisEnv;
  ticket: string;
  orderNumber: string;
};

export function MonerisCheckoutEmbed({ mode, ticket, orderNumber }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const started = useRef(false);

  useEffect(() => {
    const scriptUrl = monerisCheckoutScriptUrl(mode);

    function initCheckout() {
      if (started.current) return;
      const Checkout = window.monerisCheckout ?? window.MonerisCheckout;
      if (!Checkout) {
        setStatus("error");
        return;
      }
      started.current = true;
      try {
        const checkout = new Checkout();
        checkout.setMode(mode);
        checkout.setCheckoutDiv("moneris-checkout");
        checkout.setCallback("cancel_transaction", () => {
          sessionStorage.removeItem(SESSION_TICKET);
          router.push("/order/cancel");
        });
        checkout.setCallback("error_event", () => {
          toast.error("Payment could not be completed. Please try again.");
        });
        checkout.setCallback("payment_complete", (data: MonerisCheckoutEvent) => {
          sessionStorage.removeItem(SESSION_TICKET);
          sessionStorage.removeItem(SESSION_MODE);
          const params = new URLSearchParams({
            order_no: orderNumber,
          });
          const txn =
            (typeof data.txn_id === "string" && data.txn_id) ||
            (typeof data.transaction_id === "string" && data.transaction_id);
          const code =
            typeof data.response_code === "string" ? data.response_code : "";
          if (txn) params.set("txn_id", txn);
          if (code) params.set("response_code", code);
          router.push(`/order/success?${params.toString()}`);
        });
        checkout.startCheckout(ticket);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-moneris-checkout="${mode}"]`
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        initCheckout();
      } else {
        existing.addEventListener("load", initCheckout, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.dataset.monerisCheckout = mode;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        initCheckout();
      },
      { once: true }
    );
    script.addEventListener(
      "error",
      () => {
        setStatus("error");
        toast.error("Unable to load Moneris Checkout.");
      },
      { once: true }
    );
    document.body.appendChild(script);
  }, [mode, ticket, orderNumber, router]);

  if (status === "error") {
    return (
      <p className="text-center text-sm text-destructive">
        Payment form failed to load.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => router.push("/order/checkout")}
        >
          Return to checkout
        </button>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {status === "loading" && (
        <p className="text-center text-sm text-muted-foreground">
          Loading secure payment…
        </p>
      )}
      <div
        id="moneris-checkout"
        className="min-h-[420px] w-full rounded-xl border border-border bg-white"
      />
    </div>
  );
}

export function readMonerisPaySession(): {
  ticket: string;
  orderNumber: string;
  mode: MonerisEnv;
} | null {
  if (typeof window === "undefined") return null;
  const ticket = sessionStorage.getItem(SESSION_TICKET);
  const orderNumber = sessionStorage.getItem(SESSION_ORDER);
  const mode = sessionStorage.getItem(SESSION_MODE);
  if (!ticket || !orderNumber) return null;
  return {
    ticket,
    orderNumber,
    mode: mode === "qa" ? "qa" : "prod",
  };
}

export function writeMonerisPaySession(
  ticket: string,
  orderNumber: string,
  mode: MonerisEnv
): void {
  sessionStorage.setItem(SESSION_TICKET, ticket);
  sessionStorage.setItem(SESSION_ORDER, orderNumber);
  sessionStorage.setItem(SESSION_MODE, mode);
}
