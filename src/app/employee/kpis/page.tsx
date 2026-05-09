import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function KpisPage() {
  const me = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("kpi_assignments")
    .select("id, cycle, target, achieved, evidence_url, kpis(title, description, weight)")
    .eq("user_id", me.profile.id)
    .order("cycle", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My KPIs</h1>
      <div className="rounded-md border">
        {data?.length ? (
          <ul className="divide-y">
            {data.map((row) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const kpi = row.kpis as any;
              const pct =
                row.target && row.achieved
                  ? Math.min(100, Math.round((Number(row.achieved) / Number(row.target)) * 100))
                  : 0;
              return (
                <li key={row.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{kpi?.title}</div>
                      <div className="text-xs text-neutral-500">{row.cycle}</div>
                    </div>
                    <div className="font-mono text-sm">
                      {row.achieved ?? 0} / {row.target ?? "—"}
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-neutral-100">
                    <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-6 text-center text-sm text-neutral-500">
            No KPIs assigned yet.
          </div>
        )}
      </div>
    </div>
  );
}
