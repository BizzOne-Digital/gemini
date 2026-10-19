import type { CartLine } from "@/lib/order-utils";

const STORAGE_KEY = "homestyle-cart-v1";

/** Stable empty cart — required for useSyncExternalStore getServerSnapshot. */
const EMPTY_CART: CartLine[] = [];

let lines: CartLine[] = EMPTY_CART;
let hydrated = false;
const listeners = new Set<() => void>();

function loadStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCartServerSnapshot(): CartLine[] {
  return EMPTY_CART;
}

export function getCartSnapshot(): CartLine[] {
  if (typeof window !== "undefined" && !hydrated) {
    hydrated = true;
    lines = loadStored();
  }
  return lines;
}

export function persistCart(next: CartLine[]): void {
  lines = next.length === 0 ? EMPTY_CART : next;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  notify();
}
