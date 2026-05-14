import { createClient } from "@/lib/supabase/server";
import { SubmissionsPanel } from "./submissions-panel";

export const dynamic = "force-dynamic";

export default async function AdminKpisPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kpis")
    .select("id, title, description, weight, active")
    .order("created_at", { ascending: false });

  const { count: pendingCount } = await supabase
    .from("kpi_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">KPIs</h1>
        <button className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700">
          New KPI
        </button>
      </div>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Description</th>
              <th className="p-3">Weight</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map((k) => (
              <tr key={k.id}>
                <td className="p-3 font-medium">{k.title}</td>
                <td className="p-3 text-neutral-500">{k.description}</td>
                <td className="p-3 font-mono">{k.weight}</td>
                <td className="p-3">{k.active ? "✓" : "—"}</td>
              </tr>
            )) ?? null}
          </tbody>
        </table>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Employee Submissions</h2>
          {pendingCount ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {pendingCount} pending
            </span>
          ) : null}
        </div>
        <SubmissionsPanel />
      </section>
    </div>
  );
}
