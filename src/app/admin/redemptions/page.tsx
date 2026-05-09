import { createClient } from "@/lib/supabase/server";
import { DecisionButtons } from "./decision-buttons";

export default async function AdminRedemptionsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("redemptions")
    .select("id, user_id, item_id, points_spent, status, created_at, catalog_items(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Redemptions</h1>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">User</th>
              <th className="p-3">Item</th>
              <th className="p-3 text-right">Pts</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map((r) => (
              <tr key={r.id}>
                <td className="p-3 text-xs text-neutral-500">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="p-3 font-mono text-xs">{r.user_id.slice(0, 8)}…</td>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <td className="p-3">{(r.catalog_items as any)?.name ?? "—"}</td>
                <td className="p-3 text-right font-mono">{r.points_spent}</td>
                <td className="p-3 capitalize">{r.status}</td>
                <td className="p-3 text-right">
                  {r.status === "pending" && <DecisionButtons redemptionId={r.id} />}
                </td>
              </tr>
            )) ?? null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
