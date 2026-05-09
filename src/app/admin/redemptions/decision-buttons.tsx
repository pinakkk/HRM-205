"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DecisionButtons({ redemptionId }: { redemptionId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "approve" | "reject") {
    setPending(decision);
    setError(null);
    try {
      const res = await fetch(`/api/admin/redemptions/${redemptionId}/decide`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          disabled={pending !== null}
          onClick={() => decide("approve")}
          className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          {pending === "approve" ? "…" : "Approve"}
        </button>
        <button
          disabled={pending !== null}
          onClick={() => decide("reject")}
          className="rounded border border-rose-300 bg-rose-50 px-2 py-0.5 text-xs text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300"
        >
          {pending === "reject" ? "…" : "Reject"}
        </button>
      </div>
      {error && <span className="text-[10px] text-rose-600">{error}</span>}
    </div>
  );
}
