"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { resolveImageSrc } from "@/lib/resolve-image";

type ShopProduct = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  requiresShipping: boolean;
};

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const { addLine } = useCart();

  useEffect(() => {
    fetch("/api/shop/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  return (
    <section className="section-safe py-12 pt-[calc(var(--header-height)+2rem)]">
      <div className="container-diner">
        <h1 className="font-display text-3xl text-espresso">Shop</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Retail items with shipping and tax calculated at checkout (CAD).
        </p>

        {products.length === 0 ? (
          <p className="mt-10 text-muted-foreground">
            Products coming soon. Add items in Admin → Shop Products.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article
                key={p._id}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft"
              >
                {p.image && (
                  <div className="relative aspect-[4/3] bg-soft-oat">
                    <Image
                      src={resolveImageSrc(p.image)}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-display text-xl text-espresso">{p.name}</h2>
                  {p.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {p.description}
                    </p>
                  )}
                  <p className="mt-3 font-semibold text-heritage-green">
                    {formatPrice(p.price, p.currency)}
                  </p>
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    onClick={() => {
                      addLine({
                        name: p.name,
                        unitPrice: p.price,
                        shopProductId: p._id,
                        source: "shop",
                        requiresShipping: p.requiresShipping,
                      });
                      toast.success(`${p.name} added to cart`);
                    }}
                  >
                    Add to cart
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Button href="/order/cart" variant="outline">
            View cart
          </Button>
        </div>
      </div>
    </section>
  );
}
