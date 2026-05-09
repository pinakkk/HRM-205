import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/utils";
import { AllocatorWorkflow } from "./workflow";

export default async function AllocatorCyclePage({
  params,
}: {
  params: Promise<{ cycleId: string }>;
}) {
  const { cycleId } = await params;
  const supabase = await createClient();
  const { data: cycle } = await supabase
    .from("allocation_cycles")
    .select("id, label, pool_amount, status, created_at")
    .eq("id", cycleId)
    .maybeSingle();

  if (!cycle) notFound();

  const [{ data: ledgerRows }, { data: employees }, { data: profiles }] = await Promise.all([
    supabase
      .from("rewards_ledger")
      .select("id, user_id, amount, reason, source, rationale_json, created_at")
      .eq("cycle_id", cycleId)
      .order("created_at", { ascending: false }),
    supabase.from("users").select("id, full_name").eq("role", "employee"),
    supabase.from("users").select("id, full_name"),
  ]);

  const nameById = new Map((profiles ?? []).map((u) => [u.id, u.full_name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{cycle.label}</h1>
        <p className="text-sm text-neutral-500">
          Pool: <span className="font-mono">{formatINR(Number(cycle.pool_amount))}</span> · Status:{" "}
          <span className="capitalize">{cycle.status}</span>
        </p>
      </div>

      <AllocatorWorkflow
        cycle={{
          id: cycle.id,
          label: cycle.label,
          pool_amount: Number(cycle.pool_amount),
          status: cycle.status,
        }}
        employees={employees ?? []}
      />

      <section>
        <h2 className="mb-2 text-lg font-semibold">Published allocations</h2>
        <div className="rounded-md border">
          {ledgerRows?.length ? (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Rationale</th>
                  <th className="p-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ledgerRows.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3">{nameById.get(r.user_id) ?? r.user_id.slice(0, 8) + "…"}</td>
                    <td className="p-3 text-right font-mono">
                      {formatINR(Number(r.amount))}
                    </td>
                    <td className="p-3 text-neutral-600">{r.reason}</td>
                    <td className="p-3 text-xs uppercase text-neutral-500">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-sm text-neutral-500">
              No allocations yet. Click &quot;Generate suggestions&quot; to start.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
