"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toasts } from "@/components/ui/Toaster";

const TYPES = ["casual", "sick", "earned", "unpaid"] as const;

export function LeaveRequestForm() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [type, setType] = useState<(typeof TYPES)[number]>("casual");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!start || !end || start > end) {
      toasts.error("Pick a valid date range.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ start_date: start, end_date: end, type, reason: reason.trim() || undefined }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail ?? b.title ?? "Request failed");
      }
      toasts.success("Leave request submitted.");
      setReason("");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 dark:bg-neutral-900 dark:border-neutral-800">
      <h3 className="font-bold text-neutral-900 dark:text-white">Request leave</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input" />
        </Field>
        <Field label="End">
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="input" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="input">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reason (optional)">
          <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={140} className="input" />
        </Field>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit request"}
      </button>
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid rgb(229 229 229);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        :global(.dark .input) {
          background: rgb(38 38 38);
          border-color: rgb(64 64 64);
          color: white;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
