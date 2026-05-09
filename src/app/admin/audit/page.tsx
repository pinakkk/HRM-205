import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  anovaF,
  managerSkew,
  pairwiseDIR,
  type GroupedRewards,
} from "@/lib/audit/disparate-impact";
import { cacheGet, cacheSet } from "@/lib/redis";
import { proposeBiasNarration } from "@/lib/llm/narrator";
import type { BiasNarration } from "@/lib/llm/schemas";
import { env } from "@/lib/env";

type DirRow = { group: string; reference: string; ratio: number | null; flagged: boolean };
type SkewRow = { manager_id: string; mean: number; n: number; z: number; flagged: boolean };

type Summary = {
  disparate_impact: { gender: DirRow[]; department: DirRow[] };
  department_anova: { f: number | null; pApprox: string | null; flagged: boolean };
  manager_skew: SkewRow[];
  counts: { rows: number };
};

const NARRATION_CACHE_KEY = "audit:narration";

export default async function BiasAuditPage() {
  const supabase = await createClient();
  const { data: findings } = await supabase
    .from("audit_findings")
    .select("id, metric, group_label, value, threshold, flagged, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  let summary: Summary | null = null;
  let narration: BiasNarration | null = null;

  try {
    const admin = createAdminClient();
    const { data: rows } = await admin
      .from("rewards_ledger")
      .select("amount, kind, user_id, users(gender, department)")
      .eq("kind", "bonus")
      .limit(5000);

    const byGender: GroupedRewards = {};
    const byDept: GroupedRewards = {};
    for (const r of rows ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = (r.users as any) ?? {};
      if (u.gender) (byGender[u.gender] ??= []).push(Number(r.amount));
      if (u.department) (byDept[u.department] ??= []).push(Number(r.amount));
    }

    const { data: fb } = await admin
      .from("feedback")
      .select("from_user_id, sentiment_score")
      .not("sentiment_score", "is", null);
    const perManager: Record<string, number[]> = {};
    for (const r of fb ?? []) {
      if (r.sentiment_score === null) continue;
      (perManager[r.from_user_id] ??= []).push(Number(r.sentiment_score));
    }

    summary = {
      disparate_impact: { gender: pairwiseDIR(byGender), department: pairwiseDIR(byDept) },
      department_anova: anovaF(byDept),
      manager_skew: managerSkew(perManager),
      counts: { rows: rows?.length ?? 0 },
    };

    if (env.OPENROUTER_API_KEY && summary.counts.rows > 0) {
      const cached = await cacheGet<BiasNarration>(NARRATION_CACHE_KEY);
      if (cached) {
        narration = cached;
      } else {
        narration = await proposeBiasNarration(summary);
        if (narration) await cacheSet(NARRATION_CACHE_KEY, narration, 3600);
      }
    }
  } catch {
    summary = null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bias Audit</h1>
      <p className="text-sm text-neutral-500">
        Disparate-impact ratio, F-test, and manager-skew detectors run server-side. The LLM
        narrator below only describes the numbers — it does not decide them.
      </p>

      {narration ? (
        <section className="rounded-md border bg-indigo-50/40 p-4 dark:bg-indigo-950/20">
          <h2 className="text-base font-semibold">{narration.headline}</h2>
          <div className="mt-2 space-y-2 text-sm leading-relaxed">
            {narration.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {narration.recommendations.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {narration.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="rounded-md border border-dashed p-4 text-sm text-neutral-500">
          {summary?.counts.rows
            ? "Narrator unavailable — set OPENROUTER_API_KEY to enable."
            : "Narrator will appear once there are bonus allocations to summarise."}
        </section>
      )}

      {summary ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <DirCard title="Disparate impact — gender" rows={summary.disparate_impact.gender} />
          <DirCard title="Disparate impact — department" rows={summary.disparate_impact.department} />
          <div className="rounded-md border p-4">
            <div className="text-xs uppercase text-neutral-500">Department ANOVA</div>
            <div className="mt-1 font-mono text-2xl">
              {summary.department_anova.f !== null
                ? summary.department_anova.f.toFixed(2)
                : "—"}
            </div>
            <div className="text-xs text-neutral-500">
              p {summary.department_anova.pApprox ?? "—"}
              {summary.department_anova.flagged && (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                  flagged
                </span>
              )}
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              Sample: {summary.counts.rows} bonus rows.
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border bg-neutral-50 p-4 text-sm text-neutral-500 dark:bg-neutral-900">
          Audit summary unavailable — service-role key not configured.
        </div>
      )}

      {summary && summary.manager_skew.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Manager skew</h2>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
                <tr>
                  <th className="p-3">Manager</th>
                  <th className="p-3 text-right">Mean sentiment</th>
                  <th className="p-3 text-right">n</th>
                  <th className="p-3 text-right">z</th>
                  <th className="p-3">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {summary.manager_skew.map((m) => (
                  <tr key={m.manager_id}>
                    <td className="p-3 font-mono text-xs">{m.manager_id.slice(0, 8)}…</td>
                    <td className="p-3 text-right font-mono">{m.mean.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono">{m.n}</td>
                    <td className="p-3 text-right font-mono">{m.z.toFixed(2)}</td>
                    <td className="p-3">{m.flagged ? "⚠️" : "✓"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold">Latest findings</h2>
        <div className="rounded-md border">
          {findings?.length ? (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
                <tr>
                  <th className="p-3">Metric</th>
                  <th className="p-3">Group</th>
                  <th className="p-3 text-right">Value</th>
                  <th className="p-3 text-right">Threshold</th>
                  <th className="p-3">Flagged</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {findings.map((f) => (
                  <tr key={f.id}>
                    <td className="p-3">{f.metric}</td>
                    <td className="p-3 text-neutral-500">{f.group_label ?? "—"}</td>
                    <td className="p-3 text-right font-mono">
                      {f.value !== null ? Number(f.value).toFixed(3) : "—"}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {f.threshold !== null ? Number(f.threshold).toFixed(3) : "—"}
                    </td>
                    <td className="p-3">{f.flagged ? "⚠️" : "✓"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-sm text-neutral-500">No findings yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function DirCard({ title, rows }: { title: string; rows: DirRow[] }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-xs uppercase text-neutral-500">{title}</div>
      {rows.length === 0 ? (
        <div className="mt-2 text-sm text-neutral-500">Not enough data.</div>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {rows.map((r) => (
            <li key={`${r.group}-${r.reference}`} className="flex items-center justify-between">
              <span>
                <span className="font-medium">{r.group}</span>{" "}
                <span className="text-xs text-neutral-500">vs {r.reference}</span>
              </span>
              <span className="flex items-center gap-2 font-mono">
                {r.ratio !== null ? r.ratio.toFixed(2) : "—"}
                {r.flagged && (
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs text-rose-700">
                    DIR&lt;0.8
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
