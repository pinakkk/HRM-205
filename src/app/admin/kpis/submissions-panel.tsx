"use client";

import { useEffect, useState, useCallback } from "react";
import { toasts } from "@/components/ui/Toaster";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

type Submission = {
  id: number;
  assignment_id: number;
  user_id: string;
  achieved: number;
  note: string | null;
  evidence_url: string | null;
  status: "pending" | "approved" | "rejected";
  decision_note: string | null;
  decided_at: string | null;
  created_at: string;
  kpi_assignments: {
    cycle: string;
    target: number | null;
    achieved: number | null;
    kpis: { title: string; weight: number } | null;
  } | null;
  users: { full_name: string | null; email: string } | null;
};

type Tab = "pending" | "approved" | "rejected";

export function SubmissionsPanel() {
  const [tab, setTab] = useState<Tab>("pending");
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const load = useCallback(async (status: Tab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kpi-submissions?status=${status}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? "Failed");
      }
      const json = (await res.json()) as { submissions: Submission[] };
      setItems(json.submissions);
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  async function decide(id: number, decision: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/kpi-submissions/${id}/decide`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision, note: notes[id] || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? "Failed");
      }
      toasts.success(`Submission ${decision}d`);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-1 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        {(["pending", "approved", "rejected"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded px-3 py-1 capitalize ${
              tab === t
                ? "bg-white shadow-sm dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">No {tab} submissions.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((s) => {
            const target = Number(s.kpi_assignments?.target ?? 0);
            const current = Number(s.kpi_assignments?.achieved ?? 0);
            return (
              <li
                key={s.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {s.kpi_assignments?.kpis?.title ?? "(KPI)"}{" "}
                      <span className="text-xs font-normal text-neutral-500">
                        · {s.kpi_assignments?.cycle}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {s.users?.full_name ?? s.users?.email ?? s.user_id} · submitted{" "}
                      {new Date(s.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">
                      {current} → <span className="font-bold text-indigo-600">{s.achieved}</span>
                      {target ? <span className="text-neutral-400"> / {target}</span> : null}
                    </div>
                  </div>
                </div>

                {s.note ? (
                  <p className="mt-2 rounded bg-neutral-50 p-2 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {s.note}
                  </p>
                ) : null}

                {s.evidence_url ? (
                  <a
                    href={s.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                  >
                    Evidence <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}

                {tab === "pending" ? (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Decision note (optional)"
                      value={notes[s.id] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                      className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-950"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={busyId === s.id}
                        onClick={() => decide(s.id, "reject")}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button
                        type="button"
                        disabled={busyId === s.id}
                        onClick={() => decide(s.id, "approve")}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                ) : s.decision_note ? (
                  <p className="mt-2 text-xs text-neutral-500">Note: {s.decision_note}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
