"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type Toast = { id: number; text: string; type: "success" | "error" | "info" };
type Ctx = { toast: (text: string, type?: Toast["type"]) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);

  const toast = useCallback((text: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setList((p) => [...p, { id, text, type }]);
    setTimeout(() => setList((p) => p.filter((t) => t.id !== id)), 3600);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-5 z-[100] flex flex-col gap-2">
        {list.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-slide-up items-center gap-2.5 rounded-xl bg-ink-950 px-4 py-3 text-sm text-white shadow-pop"
          >
            {t.type === "success" && <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />}
            {t.type === "error" && <XCircle className="size-4 shrink-0 text-rose-400" />}
            {t.type === "info" && <Info className="size-4 shrink-0 text-sky-400" />}
            <span>{t.text}</span>
            <button
              onClick={() => setList((p) => p.filter((x) => x.id !== t.id))}
              className="mr-2 text-ink-400 hover:text-white"
              aria-label="بستن"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
