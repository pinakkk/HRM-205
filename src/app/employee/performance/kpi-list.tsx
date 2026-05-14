"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toasts } from "@/components/ui/Toaster";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export type EmployeeKpiRow = {
  id: number;
  cycle: string;
  target: number | null;
  achieved: number | null;
  evidence_url: string | null;
  kpis: { title: string; description: string | null; weight: number } | null;
  pending_submission?: {
    id: number;
    achieved: number;
    created_at: string;
  } | null;
  last_decision?: {
    status: "approved" | "rejected";
    decision_note: string | null;
    decided_at: string | null;
  } | null;
};

export function KpiList({ rows }: { rows: EmployeeKpiRow[] }) {
  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-neutral-500">No KPIs assigned yet.</p>;
  }
  return (
    <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
      {rows.map((row) => (
        <KpiRow key={row.id} row={row} />
      ))}
    </ul>
  );
}

function KpiRow({ row }: { row: EmployeeKpiRow }) {
  const router = useRouter();
  const target = Number(row.target ?? 0);
  const achieved = Number(row.achieved ?? 0);
  const pct = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(achieved ? String(achieved) : "");
  const [note, setNote] = useState("");
  const [evidence, setEvidence] = useState("");
  const [busy, setBusy] = useState(false);

  const hasPending = !!row.pending_submission;

  async function submit() {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) {
      toasts.error("Enter a valid non-negative number");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/me/kpi-submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assignment_id: row.id,
          achieved: num,
          note: note || undefined,
          evidence_url: evidence || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? "Failed");
      }
      toasts.success("Submitted for admin approval");
      setOpen(false);
      setNote("");
      setEvidence("");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-neutral-900 dark:text-white">{row.kpis?.title}</div>
          <div className="text-xs text-neutral-500">
            Cycle {row.cycle} · weight {row.kpis?.weight ?? 1}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
            {achieved} / {target || "—"}
          </div>
          {hasPending ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Clock className="h-3 w-3" /> Pending {row.pending_submission?.achieved}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700"
            >
              {open ? "Cancel" : "Submit progress"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
        <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
      </div>

      {row.last_decision && !hasPending ? (
        <div className="mt-2 flex items-start gap-1 text-xs text-neutral-500">
          {row.last_decision.status === "approved" ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-3.5 w-3.5 text-rose-600" />
          )}
          <span>
            Last submission {row.last_decision.status}
            {row.last_decision.decision_note ? ` · ${row.last_decision.decision_note}` : ""}
          </span>
        </div>
      ) : null}

      {open && !hasPending ? (
        <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Achieved
              <input
                type="number"
                min={0}
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                placeholder={target ? `up to ${target}` : "value"}
              />
            </label>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Evidence URL (optional)
              <input
                type="url"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                placeholder="https://…"
              />
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Note (optional)
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                placeholder="Context for the reviewer"
              />
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Submit for approval"}
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
