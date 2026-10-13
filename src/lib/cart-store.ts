import type { CartLine } from "@/lib/order-utils";

const STORAGE_KEY = "homestyle-cart-v1";

let lines: CartLine[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function loadStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
  return [];
}

export function getCartSnapshot(): CartLine[] {
  if (typeof window !== "undefined" && !hydrated) {
    hydrated = true;
    lines = loadStored();
  }
  return lines;
}

export function persistCart(next: CartLine[]): void {
  lines = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  notify();
}
