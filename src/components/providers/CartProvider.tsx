"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

export type CartItem = {
  productId: string;
  variantId?: string | null;
  variantLabel?: string | null;
  title: string;
  slug: string;
  image: string | null;
  price: number;        // unit price after discount
  basePrice: number;    // before discount
  qty: number;
  maxStock: number;
  sellerName: string;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  totalDiscount: number;
  ready: boolean;
  add: (item: CartItem) => void;
  remove: (productId: string, variantId?: string | null) => void;
  setQty: (productId: string, qty: number, variantId?: string | null) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "bzn_cart_v1";

const same = (a: CartItem, productId: string, variantId?: string | null) =>
  a.productId === productId && (a.variantId ?? null) === (variantId ?? null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => same(p, item.productId, item.variantId));
      if (idx === -1) return [...prev, item];
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        qty: Math.min(next[idx].qty + item.qty, item.maxStock || 99),
      };
      return next;
    });
  }, []);

  const remove = useCallback((productId: string, variantId?: string | null) => {
    setItems((prev) => prev.filter((p) => !same(p, productId, variantId)));
  }, []);

  const setQty = useCallback((productId: string, qty: number, variantId?: string | null) => {
    setItems((prev) =>
      prev
        .map((p) => (same(p, productId, variantId) ? { ...p, qty } : p))
        .filter((p) => p.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const totalDiscount = items.reduce((s, i) => s + (i.basePrice - i.price) * i.qty, 0);
    return { items, count, subtotal, totalDiscount, ready, add, remove, setQty, clear };
  }, [items, ready, add, remove, setQty, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
