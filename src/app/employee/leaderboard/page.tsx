import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPoints } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { DepartmentChart } from "./leaderboard-charts";
import {
  Trophy,
  TrendingUp,
  Users,
  Medal,
  Search,
  Filter,
  BarChart2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const me = await requireUser();
  const supabase = await createClient();

  try {
    await createAdminClient().rpc("refresh_points_balance");
  } catch {
    /* best-effort */
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [boardRes, ledgerRes] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("user_id, full_name, department, role, balance")
      .eq("role", "employee")
      .order("balance", { ascending: false }),
    supabase
      .from("rewards_ledger")
      .select("user_id, kind, amount, created_at")
      .gte("created_at", monthStart.toISOString()),
  ]);

  type BoardRow = { user_id: string; full_name: string; department: string | null; balance: number };
  const allRows = (boardRes.data ?? []) as BoardRow[];
  const data = allRows.slice(0, 20);
  const topThree = data.slice(0, 3);
  const restOfList = data.slice(3);

  const participants = allRows.filter((r) => Number(r.balance ?? 0) > 0).length;
  const myIndex = allRows.findIndex((r) => r.user_id === me.profile.id);
  const myRank = myIndex >= 0 ? myIndex + 1 : null;
  const myPercentile =
    myRank && allRows.length > 0 ? Math.round((myRank / allRows.length) * 100) : null;

  let monthPointsTotal = 0;
  let monthPointsRows = 0;
  const deptMonth = new Map<string, number>();
  const deptByUser = new Map(allRows.map((r) => [r.user_id, r.department ?? "Unassigned"]));
  for (const row of ledgerRes.data ?? []) {
    if (row.kind !== "points" && row.kind !== "kudos" && row.kind !== "bonus") continue;
    const amt = Number(row.amount ?? 0);
    if (row.kind !== "bonus") {
      monthPointsTotal += amt;
      monthPointsRows += 1;
    }
    const dept = deptByUser.get(row.user_id) ?? "Unassigned";
    if (row.kind !== "bonus") deptMonth.set(dept, (deptMonth.get(dept) ?? 0) + amt);
  }
  const avgMonthlyPoints =
    monthPointsRows === 0 ? 0 : Math.round(monthPointsTotal / Math.max(1, participants || monthPointsRows));

  const departmentChartData = Array.from(deptMonth.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, total]) => ({ label, total }));

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Performance Leaderboard</h1>
          <p className="text-sm text-neutral-500">Celebrating our top achievers across the organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="h-10 w-64 rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-900 dark:border-neutral-800"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Top Performers Podium */}
      <div className="grid gap-6 md:grid-cols-3">
        {topThree.map((employee, i) => (
          <div key={employee.user_id} className={`relative flex flex-col items-center justify-center rounded-2xl border p-6 shadow-sm transition-all hover:scale-[1.02] ${
            i === 0 
              ? "border-amber-200 bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/10 dark:to-neutral-900 dark:border-amber-900/30" 
              : "border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800"
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm dark:bg-neutral-800">
              Rank #{i + 1}
            </div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-neutral-100 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
              <div className="text-xl font-bold text-neutral-400">{employee.full_name.charAt(0)}</div>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{employee.full_name}</h3>
            <p className="text-[10px] text-neutral-500 uppercase font-medium">{employee.department ?? "General"}</p>
            <div className={`mt-4 flex items-center gap-2 rounded-full px-4 py-1 text-sm font-black ${
              i === 0 ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            }`}>
              {formatPoints(Number(employee.balance ?? 0))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Global Ranking System */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-800/30">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <Medal className="h-4 w-4 text-neutral-400" /> All Employee Rankings
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100 text-[10px] font-black uppercase text-neutral-400 dark:border-neutral-800">
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {restOfList.map((row, i) => (
                  <tr key={row.user_id} className={`hover:bg-neutral-50/50 transition-colors dark:hover:bg-neutral-800/30 ${
                    row.user_id === me.profile.id ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                  }`}>
                    <td className="px-6 py-4 text-sm font-bold text-neutral-500">#{i + 4}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-400 dark:bg-neutral-800">
                          {row.full_name.charAt(0)}
                        </div>
                        <div className="text-sm font-bold text-neutral-900 dark:text-white">{row.full_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-neutral-500">{row.department ?? "—"}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-neutral-900 dark:text-white">
                      {formatPoints(Number(row.balance ?? 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="flex flex-col gap-6">
          {/* Your Stats */}
          <div className="rounded-xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-100 dark:shadow-none">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Your Rank</span>
            </div>
            <div className="text-4xl font-black">{myRank ? `#${myRank}` : "—"}</div>
            <p className="mt-2 text-xs text-indigo-100">
              {myRank && myPercentile !== null
                ? `Top ${myPercentile}% of ${allRows.length} employees. Keep it up!`
                : "Earn points to enter the leaderboard."}
            </p>
          </div>

          {/* Department-wise Ranking Chart */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white text-sm">
                <BarChart2 className="h-4 w-4 text-neutral-400" /> Dept Performance
              </h3>
            </div>
            <div className="h-[250px] w-full">
              <DepartmentChart data={departmentChartData} />
            </div>
            <div className="mt-4 text-[10px] text-center text-neutral-500 italic">
              Points accumulation by department (current cycle)
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                  <Users className="h-4 w-4" /> Total Participants
                </div>
                <span className="text-xs font-black text-neutral-900 dark:text-white">{formatPoints(participants)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                  <Trophy className="h-4 w-4" /> Avg. Monthly Points
                </div>
                <span className="text-xs font-black text-neutral-900 dark:text-white">{formatPoints(avgMonthlyPoints)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
