import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leaderboard")
    .select("user_id, full_name, department, balance")
    .order("balance", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Department</th>
              <th className="p-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map((row, i) => (
              <tr key={row.user_id ?? i}>
                <td className="p-3 font-mono">{i + 1}</td>
                <td className="p-3">{row.full_name}</td>
                <td className="p-3 text-neutral-500">{row.department ?? "—"}</td>
                <td className="p-3 text-right font-mono">
                  {formatPoints(Number(row.balance ?? 0))}
                </td>
              </tr>
            )) ?? null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
