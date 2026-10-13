import { Button } from "@/components/ui/Button";

export default function OrderCancelPage() {
  return (
    <section className="section-safe py-16 pt-[calc(var(--header-height)+2rem)]">
      <div className="container-diner mx-auto max-w-lg text-center">
        <h1 className="font-display text-3xl text-espresso">Payment cancelled</h1>
        <p className="mt-4 text-muted-foreground">
          No charge was made. Your cart is still available if you&apos;d like to try again.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/order/cart" variant="outline">
            Return to cart
          </Button>
          <Button href="/menu">
            Browse menu
          </Button>
        </div>
      </div>
    </section>
  );
}
