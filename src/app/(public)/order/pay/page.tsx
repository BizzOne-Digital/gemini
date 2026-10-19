"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MonerisCheckoutEmbed,
  readMonerisPaySession,
} from "@/components/order/MonerisCheckoutEmbed";
import type { MonerisEnv } from "@/lib/moneris";

export default function OrderPayPage() {
  const router = useRouter();
  const [session, setSession] = useState<{
    ticket: string;
    orderNumber: string;
    mode: MonerisEnv;
  } | null>(null);

  useEffect(() => {
    const data = readMonerisPaySession();
    if (!data) {
      router.replace("/order/cart");
      return;
    }
    setSession(data);
  }, [router]);

  if (!session) {
    return (
      <section className="section-safe py-12 pt-[calc(var(--header-height)+2rem)]">
        <div className="container-diner mx-auto max-w-2xl text-center text-sm text-muted-foreground">
          Preparing payment…
        </div>
      </section>
    );
  }

  return (
    <section className="section-safe py-12 pt-[calc(var(--header-height)+2rem)]">
      <div className="container-diner mx-auto max-w-2xl">
        <h1 className="font-display text-3xl text-espresso">Pay with Moneris</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order {session.orderNumber} — complete payment below.
        </p>
        <div className="mt-8">
          <MonerisCheckoutEmbed
            mode={session.mode}
            ticket={session.ticket}
            orderNumber={session.orderNumber}
          />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/order/cancel" className="underline">
            Cancel payment
          </Link>
        </p>
      </div>
    </section>
  );
}
