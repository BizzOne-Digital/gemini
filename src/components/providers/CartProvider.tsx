"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { CartLine } from "@/lib/order-utils";
import type { OrderSource } from "@/models/Order";
import {
  getCartServerSnapshot,
  getCartSnapshot,
  persistCart,
  subscribeCart,
} from "@/lib/cart-store";

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  addLine: (line: Omit<CartLine, "lineId" | "quantity"> & { quantity?: number }) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot
  );

  const addLine = useCallback(
    (
      line: Omit<CartLine, "lineId" | "quantity"> & { quantity?: number }
    ) => {
      const quantity = line.quantity ?? 1;
      const current = getCartSnapshot();
      const existing = current.find(
        (l) =>
          l.menuItemId === line.menuItemId &&
          l.shopProductId === line.shopProductId &&
          l.name === line.name
      );

      if (existing) {
        persistCart(
          current.map((l) =>
            l.lineId === existing.lineId
              ? { ...l, quantity: l.quantity + quantity }
              : l
          )
        );
        return;
      }

      const lineId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `line-${Date.now()}`;

      persistCart([
        ...current,
        {
          ...line,
          lineId,
          quantity,
          source: line.source ?? ("menu" as OrderSource),
        },
      ]);
    },
    []
  );

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    const current = getCartSnapshot();
    if (quantity <= 0) {
      persistCart(current.filter((l) => l.lineId !== lineId));
      return;
    }
    persistCart(
      current.map((l) => (l.lineId === lineId ? { ...l, quantity } : l))
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    persistCart(getCartSnapshot().filter((l) => l.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => persistCart([]), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      addLine,
      updateQuantity,
      removeLine,
      clearCart,
    }),
    [lines, itemCount, addLine, updateQuantity, removeLine, clearCart]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
