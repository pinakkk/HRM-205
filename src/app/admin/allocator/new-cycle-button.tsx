"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewCycleButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [pool, setPool] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/allocator/cycles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label, pool_amount: Number(pool) }),
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
                min="1"
                step="1"
                required
                className="w-full rounded border px-2 py-1 text-sm font-mono"
              />
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
