import { createClient } from "@/lib/supabase/server";

export default async function BiasAuditPage() {
  const supabase = await createClient();
  const { data: findings } = await supabase
    .from("audit_findings")
    .select("id, metric, group_label, value, threshold, flagged, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bias Audit</h1>
      <p className="text-sm text-neutral-500">
        Disparate-impact ratio, F-test, and manager-skew detectors run server-side. The LLM
        narrates findings — it does not decide them.
      </p>

      <div className="rounded-md border bg-neutral-50 p-6 text-sm text-neutral-500 dark:bg-neutral-900">
        Narrator paragraph (cached 1h) appears here once Phase 4 is wired up.
      </div>

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
            <div className="p-6 text-center text-sm text-neutral-500">
              No findings yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
