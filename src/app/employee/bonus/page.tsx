import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";
import { attendancePercent } from "@/lib/streaks";
import { BonusPerformanceChart } from "./bonus-charts";
import {
  Coins,
  History,
  TrendingUp,
  ArrowUpRight,
  Target,
  Award,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Each unit of KPI weight is worth this much in rupees of incentive potential.
const INCENTIVE_RATE_PER_WEIGHT = 1000;

type AssignmentRow = {
  id: number;
  cycle: string;
  target: number | null;
  achieved: number | null;
  kpis: { title: string; weight: number } | null;
};

export default async function BonusPage() {
  const me = await requireUser();
  const supabase = await createClient();

  const since180 = new Date(Date.now() - 180 * 86400_000).toISOString();
  const since60 = new Date(Date.now() - 60 * 86400_000).toISOString();
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

  const [
    { data: balance },
    { data: bonusHistory },
    { data: bonusYearRows },
    { data: assignments },
    { data: att },
  ] = await Promise.all([
    supabase
      .from("points_balance")
      .select("bonus_total")
      .eq("user_id", me.profile.id)
      .maybeSingle(),
    supabase
      .from("rewards_ledger")
      .select("id, amount, reason, created_at")
      .eq("user_id", me.profile.id)
      .eq("kind", "bonus")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("rewards_ledger")
      .select("amount, created_at")
      .eq("user_id", me.profile.id)
      .eq("kind", "bonus")
      .gte("created_at", since180),
    supabase
      .from("kpi_assignments")
      .select("id, cycle, target, achieved, kpis(title, weight)")
      .eq("user_id", me.profile.id)
      .order("cycle", { ascending: false }),
    supabase
      .from("attendance")
      .select("check_in")
      .eq("user_id", me.profile.id)
      .gte("check_in", since60),
  ]);

  const rawAssignments = (assignments ?? []) as unknown as AssignmentRow[];
  const latestCycle = rawAssignments[0]?.cycle ?? null;
  const activeIncentives = rawAssignments.filter(
    (r) =>
      r.cycle === latestCycle &&
      Number(r.achieved ?? 0) < Number(r.target ?? 0) &&
      Number(r.target ?? 0) > 0,
  );

  const activeIncentivesTotal = activeIncentives.reduce(
    (sum, r) => sum + Number(r.kpis?.weight ?? 0) * INCENTIVE_RATE_PER_WEIGHT,
    0,
  );

  const productivityScore = computeKpiScore(rawAssignments.filter((r) => r.cycle === latestCycle));
  const attendancePct = attendancePercent(
    (att ?? []).map((a) => a.check_in),
    30,
  );

  const bonusYTD = Number(balance?.bonus_total ?? 0);
  const elapsedMonths = Math.max(1, now.getMonth() + 1);
  const remainingMonths = 12 - elapsedMonths;
  // Run-rate projection of the next quarter, scaled by current performance.
  const runRatePerMonth = bonusYTD / elapsedMonths;
  const perfFactor = (productivityScore / 100) * 0.7 + (attendancePct / 100) * 0.3;
  const projectedNextQuarter = Math.round(
    runRatePerMonth * Math.min(3, Math.max(1, remainingMonths)) * (0.5 + perfFactor),
  );

  const monthlyBonus = bucketMonthlyBonus(bonusYearRows ?? [], 6);

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Bonus & Incentives</h1>
        <p className="text-sm text-neutral-500">Track your performance bonuses, active incentives, and earning potential.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Coins className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold text-neutral-500">Total Bonus Earned</div>
          <div className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">
            ₹{formatPoints(bonusYTD)}
          </div>
          <div className="mt-2 text-xs font-medium text-indigo-600 flex items-center gap-1">
            Year to date
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <Zap className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold text-neutral-500">Active Incentives</div>
          <div className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">
            ₹{formatPoints(activeIncentivesTotal)}
          </div>
          <div className="mt-2 text-xs font-medium text-neutral-400">
            {activeIncentives.length > 0
              ? `Across ${activeIncentives.length} active KPI${activeIncentives.length === 1 ? "" : "s"}`
              : "No active KPIs in current cycle"}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold text-neutral-500">Projected Next Quarter</div>
          <div className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">
            ₹{formatPoints(projectedNextQuarter)}
          </div>
          <div className="mt-2 text-xs font-medium text-green-600 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> Based on current KPIs & attendance
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Bonus Details */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <Award className="h-5 w-5 text-neutral-400" /> Performance Bonus Details
            </h3>
            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Monthly Bonus</div>
          </div>
          <div className="h-[250px] w-full">
            <BonusPerformanceChart labels={monthlyBonus.labels} data={monthlyBonus.values} />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Attendance Score</span>
              <span className={`text-xs font-bold ${attendanceLabelColor(attendancePct)}`}>
                {attendanceLabel(attendancePct)} ({attendancePct}%)
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">KPI Fulfillment</span>
              <span className={`text-xs font-bold ${kpiLabelColor(productivityScore)}`}>
                {kpiLabel(productivityScore)} ({productivityScore}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Active Incentives */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                <Target className="h-5 w-5 text-neutral-400" /> Active Incentives
              </h3>
            </div>
            <div className="space-y-6">
              {activeIncentives.length === 0 ? (
                <p className="text-center text-xs text-neutral-500 py-4">
                  No active incentives in the current cycle.
                </p>
              ) : (
                activeIncentives.map((inc) => {
                  const target = Number(inc.target ?? 0);
                  const achieved = Number(inc.achieved ?? 0);
                  const progress = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;
                  const reward = Number(inc.kpis?.weight ?? 0) * INCENTIVE_RATE_PER_WEIGHT;
                  return (
                    <div key={inc.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {inc.kpis?.title ?? "KPI"}
                        </span>
                        <span className="font-black text-indigo-600">₹{formatPoints(reward)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500">
                        <span>{progress}% complete</span>
                        <span>Cycle: {inc.cycle}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bonus History */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                <History className="h-5 w-5 text-neutral-400" /> Bonus History
              </h3>
            </div>
            <div className="space-y-3">
              {bonusHistory && bonusHistory.length > 0 ? (
                bonusHistory.map((bonus) => (
                  <div
                    key={bonus.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-50 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white capitalize">
                        {bonus.reason}
                      </h4>
                      <p className="text-[10px] text-neutral-500">
                        {new Date(bonus.created_at).toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-neutral-900 dark:text-white">
                        ₹{formatPoints(Number(bonus.amount))}
                      </div>
                      <div className="text-[10px] font-medium text-green-600">Paid</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-neutral-500 py-4">
                  No bonus payouts yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function computeKpiScore(rows: AssignmentRow[]): number {
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

function bucketMonthlyBonus(
  rows: { amount: number | string; created_at: string }[],
  monthsBack: number,
): { labels: string[]; values: number[] } {
  const now = new Date();
  const labels: string[] = [];
  const keys: string[] = [];
  const totals: Record<string, number> = {};
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    labels.push(d.toLocaleString(undefined, { month: "short" }));
    keys.push(key);
    totals[key] = 0;
  }
  for (const r of rows) {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in totals) totals[key] += Number(r.amount ?? 0);
  }
  return { labels, values: keys.map((k) => totals[k]) };
}

function attendanceLabel(pct: number): string {
  if (pct >= 95) return "Excellent";
  if (pct >= 85) return "Good";
  if (pct >= 70) return "Average";
  return "Needs work";
}
function attendanceLabelColor(pct: number): string {
  if (pct >= 95) return "text-green-600";
  if (pct >= 85) return "text-indigo-600";
  if (pct >= 70) return "text-amber-600";
  return "text-rose-600";
}
function kpiLabel(pct: number): string {
  if (pct >= 100) return "Target Reached";
  if (pct >= 75) return "On Track";
  if (pct >= 50) return "Halfway";
  return "Behind";
}
function kpiLabelColor(pct: number): string {
  if (pct >= 100) return "text-green-600";
  if (pct >= 75) return "text-indigo-600";
  if (pct >= 50) return "text-amber-600";
  return "text-rose-600";
}
