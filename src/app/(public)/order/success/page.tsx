"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const urlOrderNo =
    searchParams.get("order_no") || searchParams.get("order_number");
  const [sessionOrderNo] = useState(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("pendingOrderNumber")
      : null
  );
  const orderNo = urlOrderNo || sessionOrderNo;
  const [confirmStatus, setConfirmStatus] = useState<"ok" | "pending" | "error">(
    () => (orderNo ? "pending" : "ok")
  );

  useEffect(() => {
    if (!orderNo) return;

    fetch("/api/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber: orderNo,
        transactionId:
          searchParams.get("txn_id") || searchParams.get("transaction_id"),
        responseCode:
          searchParams.get("response_code") || searchParams.get("responseCode"),
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          setConfirmStatus("ok");
          sessionStorage.removeItem("pendingOrderNumber");
        } else {
          setConfirmStatus("error");
        }
      })
      .catch(() => setConfirmStatus("error"));
  }, [orderNo, searchParams]);

  return (
    <section className="section-safe py-16 pt-[calc(var(--header-height)+2rem)]">
      <div className="container-diner mx-auto max-w-lg text-center">
        {confirmStatus === "pending" && <p>Confirming your payment…</p>}
        {confirmStatus === "ok" && (
          <>
            <h1 className="font-display text-3xl text-espresso">Thank you!</h1>
            <p className="mt-4 text-muted-foreground">
              Your order{orderNo ? ` ${orderNo}` : ""} has been received.
              We&apos;ll start preparing it shortly.
            </p>
            <Button href="/" className="mt-8">
              Back to home
            </Button>
          </>
        )}
        {confirmStatus === "error" && (
          <>
            <h1 className="font-display text-3xl text-espresso">Payment issue</h1>
            <p className="mt-4 text-muted-foreground">
              We could not confirm payment online. If you were charged, please call
              519-725-5048 with reference {orderNo || "your order"}.
            </p>
            <Button href="/contact" variant="outline" className="mt-8">
              Contact us
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
