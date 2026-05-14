"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const MIN_POOL = 1000;

export function NewCycleButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [pool, setPool] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function localValidation(): string | null {
    const trimmed = label.trim();
    if (trimmed.length < 3) return "Label must be at least 3 characters.";
    if (!/[A-Za-z]/.test(trimmed)) return "Label must contain at least one letter.";
    const amount = Number(pool);
    if (!Number.isFinite(amount) || amount <= 0) return "Pool must be a positive number.";
    if (!Number.isInteger(amount)) return "Pool must be a whole rupee amount.";
    if (amount < MIN_POOL) return `Pool must be at least ₹${MIN_POOL.toLocaleString("en-IN")}.`;
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const localErr = localValidation();
    if (localErr) {
      setError(localErr);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/allocator/cycles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: label.trim(), pool_amount: Number(pool) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as { id: string };
      setOpen(false);
      setLabel("");
      setPool("");
      router.push(`/admin/allocator/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
      >
        New cycle
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-6 shadow-lg dark:bg-neutral-950"
          >
            <h2 className="text-lg font-semibold">New allocation cycle</h2>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Label
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="2026-05 Bonus"
                required
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Pool amount (INR)
              </label>
              <input
                value={pool}
                onChange={(e) => setPool(e.target.value)}
                type="number"
                min={MIN_POOL}
                step="1"
                required
                placeholder={`min ₹${MIN_POOL.toLocaleString("en-IN")}`}
                className="w-full rounded border px-2 py-1 text-sm font-mono"
              />
              <p className="text-[10px] text-neutral-500">
                Minimum ₹{MIN_POOL.toLocaleString("en-IN")}. The server also enforces ₹100 per
                employee so each allocation is meaningful.
              </p>
            </div>
            {error && <div className="text-xs text-rose-600">{error}</div>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
