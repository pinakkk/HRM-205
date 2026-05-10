"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toasts } from "@/components/ui/Toaster";

export function ManualAwardForm({
  employees,
}: {
  employees: { id: string; full_name: string; department: string | null }[];
}) {
  const router = useRouter();
  const [userId, setUserId] = useState(employees[0]?.id ?? "");
  const [kind, setKind] = useState<"points" | "bonus">("points");
  const [amount, setAmount] = useState(100);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !reason.trim() || amount <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_id: userId, kind, amount, reason: reason.trim() }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail ?? b.title ?? "Award failed");
      }
      toasts.success("Reward awarded.");
      setReason("");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Award failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
      <h3 className="font-bold text-neutral-900 dark:text-white">Award reward</h3>
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Kind</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="points">Points</option>
            <option value="bonus">Bonus (₹)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Amount</label>
          <input
            type="number"
            value={amount}
            min={1}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Reason</label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          maxLength={140}
          placeholder="Onboarded a new hire / shipped feature X / etc."
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !userId || !reason.trim() || amount <= 0}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Awarding…" : "Award"}
      </button>
    </form>
  );
}
