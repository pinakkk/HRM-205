"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toasts } from "@/components/ui/Toaster";

type Leave = {
  id: number;
  user_id: string;
  start_date: string;
  end_date: string;
  type: string;
  reason: string | null;
  name: string;
};

export function LeaveDecisionRow({ leave }: { leave: Leave }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approved" | "rejected" | null>(null);

  async function decide(decision: "approved" | "rejected") {
    setBusy(decision);
    try {
      const res = await fetch(`/api/admin/leaves/${leave.id}/decide`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail ?? b.title ?? "Failed");
      }
      toasts.success(`Leave ${decision}.`);
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="flex items-center justify-between gap-4 px-5 py-3">
      <div className="min-w-0">
        <div className="font-semibold text-neutral-900 dark:text-white">{leave.name}</div>
        <div className="text-xs text-neutral-500 capitalize">
          {leave.type} · {leave.start_date} → {leave.end_date}
        </div>
        {leave.reason && (
          <div className="mt-0.5 text-xs italic text-neutral-500">"{leave.reason}"</div>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => decide("approved")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> Approve
        </button>
        <button
          onClick={() => decide("rejected")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/40 dark:bg-neutral-900 dark:text-rose-300"
        >
          <X className="h-3.5 w-3.5" /> Reject
        </button>
      </div>
    </li>
  );
}
