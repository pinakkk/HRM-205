"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { toasts } from "@/components/ui/Toaster";

export function EotmSelector({
  year,
  month,
  employees,
  defaultUserId,
}: {
  year: number;
  month: number;
  employees: { id: string; full_name: string; department: string | null }[];
  defaultUserId: string;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState(defaultUserId);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/eotm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ year, month, user_id: userId, reason: reason.trim() || undefined }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail ?? b.title ?? "Save failed");
      }
      toasts.success("Employee of the Month saved.");
      setReason("");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-amber-500" />
        <h3 className="font-bold text-neutral-900 dark:text-white">Set Employee of the Month</h3>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Employee</label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        >
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name} {e.department ? `· ${e.department}` : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Reason (optional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder="Why this employee earned EOTM…"
          className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !userId}
        className="w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Set EOTM"}
      </button>
    </form>
  );
}
