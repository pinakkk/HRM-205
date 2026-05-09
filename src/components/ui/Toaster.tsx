"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string; tone: "info" | "success" | "error" };

let nextId = 1;
const listeners = new Set<(t: Toast) => void>();

export function toast(message: string, tone: Toast["tone"] = "info") {
  const t: Toast = { id: nextId++, message, tone };
  listeners.forEach((l) => l(t));
}

export const toasts = {
  success: (m: string) => toast(m, "success"),
  error: (m: string) => toast(m, "error"),
  info: (m: string) => toast(m, "info"),
};

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const onToast = (t: Toast) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    listeners.add(onToast);
    return () => {
      listeners.delete(onToast);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-md border px-3 py-2 text-sm shadow-lg ${TONE[t.tone]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

const TONE: Record<Toast["tone"], string> = {
  info: "border-neutral-200 bg-white text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  error:
    "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200",
};
