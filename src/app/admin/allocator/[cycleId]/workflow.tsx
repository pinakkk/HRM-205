"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/lib/utils";
import type { Allocation, AllocationItem } from "@/lib/llm/schemas";

type Cycle = {
  id: string;
  label: string;
  pool_amount: number;
  status: "draft" | "published" | "closed";
};

type EmployeeFeature = {
  user_id: string;
  full_name: string;
  attendance_pct: number;
  kpi_score: number;
  peer_sentiment: number;
  tenure_months: number;
};

export function AllocatorWorkflow({
  cycle,
  employees,
}: {
  cycle: Cycle;
  employees: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [features, setFeatures] = useState<EmployeeFeature[] | null>(null);
  const [loading, setLoading] = useState<"generate" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);

  const nameById = new Map(employees.map((e) => [e.id, e.full_name]));
  const featureById = new Map((features ?? []).map((f) => [f.user_id, f]));

  const total = allocation?.allocations.reduce((s, a) => s + a.amount, 0) ?? 0;
  const remaining = cycle.pool_amount - total;
  const overPool = remaining < -0.5;
  const overCap = allocation?.allocations.some((a) => a.amount > cycle.pool_amount * 0.25 + 0.5);

  async function generate() {
    setLoading("generate");
    setError(null);
    try {
      const res = await fetch("/api/admin/allocator/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cycle_id: cycle.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as {
        allocation: Allocation;
        features: EmployeeFeature[];
      };
      setAllocation(data.allocation);
      setFeatures(data.features);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(null);
    }
  }

  async function publish() {
    if (!allocation) return;
    if (overPool) {
      setError("Allocations exceed pool. Adjust amounts before publishing.");
      return;
    }
    setLoading("publish");
    setError(null);
    try {
      const res = await fetch("/api/admin/allocator/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cycle_id: cycle.id, allocation }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(null);
    }
  }

  function updateAmount(userId: string, raw: string) {
    if (!allocation) return;
    const amount = Math.max(0, Number(raw) || 0);
    setAllocation({
      ...allocation,
      allocations: allocation.allocations.map((a) =>
        a.user_id === userId ? { ...a, amount } : a,
      ),
      pool_residual: cycle.pool_amount - allocation.allocations.reduce(
        (s, a) => s + (a.user_id === userId ? amount : a.amount),
        0,
      ),
    });
  }

  const drawerItem: AllocationItem | undefined = drawerUserId
    ? allocation?.allocations.find((a) => a.user_id === drawerUserId)
    : undefined;
  const drawerFeature = drawerUserId ? featureById.get(drawerUserId) : undefined;

  if (cycle.status !== "draft") {
    return (
      <div className="rounded-md border bg-neutral-50 p-4 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
        This cycle is{" "}
        <span className="font-medium capitalize text-neutral-900 dark:text-neutral-100">
          {cycle.status}
        </span>
        . Allocations below are read from the ledger.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={generate}
          disabled={loading !== null}
          className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading === "generate" ? "Generating…" : allocation ? "Regenerate" : "Generate suggestions"}
        </button>
        <button
          onClick={publish}
          disabled={!allocation || loading !== null || overPool}
          className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50 disabled:opacity-50 dark:hover:bg-neutral-900"
        >
          {loading === "publish" ? "Publishing…" : "Publish"}
        </button>
      </div>

      {error && (
        <div className="rounded border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {allocation && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Pool" value={formatINR(cycle.pool_amount)} />
            <Stat label="Allocated" value={formatINR(total)} />
            <Stat
              label="Remaining"
              value={formatINR(remaining)}
              tone={overPool ? "danger" : remaining > 0 ? "neutral" : "good"}
            />
          </div>

          {overCap && (
            <div className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              One or more allocations exceed the 25% per-employee cap. The server will clamp on
              publish.
            </div>
          )}

          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Confidence</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allocation.allocations.map((a) => (
                  <tr key={a.user_id}>
                    <td className="p-3">
                      <div className="font-medium">{nameById.get(a.user_id) ?? a.user_id}</div>
                      <div className="text-xs text-neutral-500 line-clamp-1">{a.rationale}</div>
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={a.amount}
                        onChange={(e) => updateAmount(a.user_id, e.target.value)}
                        className="w-28 rounded border px-2 py-0.5 text-right font-mono text-sm"
                      />
                    </td>
                    <td className="p-3 text-right font-mono text-xs text-neutral-500">
                      {(a.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setDrawerUserId(a.user_id)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Why?
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {drawerItem && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/50"
          onClick={() => setDrawerUserId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-md space-y-4 overflow-y-auto bg-white p-6 shadow-xl dark:bg-neutral-950"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase text-neutral-500">Rationale</div>
                <h3 className="text-lg font-semibold">
                  {nameById.get(drawerItem.user_id) ?? drawerItem.user_id}
                </h3>
              </div>
              <button
                onClick={() => setDrawerUserId(null)}
                className="text-sm text-neutral-500 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>
            <p className="text-sm leading-relaxed">{drawerItem.rationale}</p>
            <div className="rounded-md border p-3 text-xs">
              <div className="mb-2 font-medium">Inputs</div>
              {drawerFeature ? (
                <dl className="grid grid-cols-2 gap-y-1">
                  <dt className="text-neutral-500">Attendance</dt>
                  <dd className="text-right font-mono">{drawerFeature.attendance_pct}%</dd>
                  <dt className="text-neutral-500">KPI</dt>
                  <dd className="text-right font-mono">{drawerFeature.kpi_score}</dd>
                  <dt className="text-neutral-500">Peer sentiment</dt>
                  <dd className="text-right font-mono">{drawerFeature.peer_sentiment}</dd>
                  <dt className="text-neutral-500">Tenure (months)</dt>
                  <dd className="text-right font-mono">{drawerFeature.tenure_months}</dd>
                </dl>
              ) : (
                <p className="text-neutral-500">No feature snapshot available.</p>
              )}
            </div>
            <div className="rounded-md border p-3 text-xs">
              <div className="mb-2 font-medium">Allocation</div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Amount</span>
                <span className="font-mono">{formatINR(drawerItem.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Confidence</span>
                <span className="font-mono">{(drawerItem.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-rose-600"
      : tone === "good"
        ? "text-emerald-600"
        : "text-neutral-900 dark:text-neutral-100";
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className={`mt-1 font-mono text-lg ${toneClass}`}>{value}</div>
    </div>
  );
}
