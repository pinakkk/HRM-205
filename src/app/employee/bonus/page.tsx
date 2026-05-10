import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";
import { BonusPerformanceChart } from "./bonus-charts";
import {
  Coins,
  History,
  TrendingUp,
  ArrowUpRight,
  Target,
  Award,
  Zap
} from "lucide-react";

export default async function BonusPage() {
  const me = await requireUser();
  const supabase = await createClient();

  // Fetch bonus balance
  const { data: balance } = await supabase
    .from("points_balance")
    .select("bonus_total")
    .eq("user_id", me.profile.id)
    .maybeSingle();

  const mockBonusHistory = [
    { id: 1, title: "Q1 Performance Bonus", amount: "₹15,000", date: "31 Mar 2025", status: "Paid" },
    { id: 2, title: "Referral Incentive", amount: "₹5,000", date: "15 Feb 2025", status: "Paid" },
    { id: 3, title: "Project Completion Bonus", amount: "₹10,000", date: "10 Jan 2025", status: "Paid" },
  ];

  const mockIncentives = [
    { title: "Project Alpha Launch", reward: "₹8,000", deadline: "30 May 2025", progress: 75 },
    { title: "Team Mentorship", reward: "₹3,000", deadline: "15 Jun 2025", progress: 40 },
  ];

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
            ₹{formatPoints(balance?.bonus_total ?? 0)}
          </div>
          <div className="mt-2 text-xs font-medium text-indigo-600 flex items-center gap-1">
            Current Financial Year
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <Zap className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold text-neutral-500">Active Incentives</div>
          <div className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">₹11,000</div>
          <div className="mt-2 text-xs font-medium text-neutral-400">Across 2 ongoing projects</div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold text-neutral-500">Projected Q2 Bonus</div>
          <div className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">₹18,500</div>
          <div className="mt-2 text-xs font-medium text-green-600 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> Based on current KPIs
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
            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Monthly Index</div>
          </div>
          <div className="h-[250px] w-full">
            <BonusPerformanceChart />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
              <span className="text-xs font-medium text-neutral-600">Attendance Score</span>
              <span className="text-xs font-bold text-green-600">Excellent (98%)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
              <span className="text-xs font-medium text-neutral-600">KPI Fulfillment</span>
              <span className="text-xs font-bold text-indigo-600">Target Reached</span>
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
              {mockIncentives.map((inc, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-neutral-900 dark:text-white">{inc.title}</span>
                    <span className="font-black text-indigo-600">{inc.reward}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-500" 
                      style={{ width: `${inc.progress}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span>{inc.progress}% complete</span>
                    <span>Ends: {inc.deadline}</span>
                  </div>
                </div>
              ))}
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
              {mockBonusHistory.map((bonus) => (
                <div key={bonus.id} className="flex items-center justify-between rounded-lg border border-neutral-50 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">{bonus.title}</h4>
                    <p className="text-[10px] text-neutral-500">{bonus.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-neutral-900 dark:text-white">{bonus.amount}</div>
                    <div className="text-[10px] font-medium text-green-600">{bonus.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
