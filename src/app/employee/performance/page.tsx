import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuggestionsPanel } from "./suggestions";
import { BarChart3, Target } from "lucide-react";

export const dynamic = "force-dynamic";

type AssignmentRow = {
  id: number;
  cycle: string;
  target: number | null;
  achieved: number | null;
  evidence_url: string | null;
  kpis: { title: string; description: string | null; weight: number } | null;
};

export default async function PerformancePage() {
  const me = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("kpi_assignments")
    .select("id, cycle, target, achieved, evidence_url, kpis(title, description, weight)")
    .eq("user_id", me.profile.id)
    .order("cycle", { ascending: false });

  const rows = (data ?? []) as unknown as AssignmentRow[];

  const score = computeScore(rows);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Performance</h1>
        <p className="text-sm text-neutral-500">Your KPI progress and AI-powered improvement suggestions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Stat label="Overall productivity" value={`${score}%`} icon={<Target className="h-5 w-5" />} accent="indigo" />
        <Stat label="Active KPIs" value={String(rows.filter((r) => Number(r.achieved ?? 0) < Number(r.target ?? 0)).length)} icon={<BarChart3 className="h-5 w-5" />} accent="amber" />
        <Stat label="Completed KPIs" value={String(rows.filter((r) => Number(r.achieved ?? 0) >= Number(r.target ?? 0) && Number(r.target ?? 0) > 0).length)} icon={<Target className="h-5 w-5" />} accent="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
          <h3 className="mb-4 font-bold text-neutral-900 dark:text-white">My KPIs</h3>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">No KPIs assigned yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {rows.map((row) => {
                const target = Number(row.target ?? 0);
                const achieved = Number(row.achieved ?? 0);
                const pct = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;
                return (
                  <li key={row.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 dark:text-white">{row.kpis?.title}</div>
                        <div className="text-xs text-neutral-500">Cycle {row.cycle} · weight {row.kpis?.weight ?? 1}</div>
                      </div>
                      <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
                        {achieved} / {target || "—"}
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                      <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-1">
          <SuggestionsPanel />
        </div>
      </div>
    </div>
  );
}

function computeScore(rows: AssignmentRow[]): number {
  let weight = 0;
  let weighted = 0;
  for (const r of rows) {
    const t = Number(r.target ?? 0);
    const a = Number(r.achieved ?? 0);
    if (t <= 0) continue;
    const w = Number(r.kpis?.weight ?? 1);
    weight += w;
    weighted += w * Math.min(1, a / t);
  }
  return weight === 0 ? 0 : Math.round((weighted / weight) * 100);
}

function Stat({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: "indigo" | "amber" | "emerald" }) {
  const accents = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
  };
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${accents[accent]}`}>{icon}</div>
      <div className="text-sm font-semibold text-neutral-500">{label}</div>
      <div className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">{value}</div>
    </div>
  );
}
