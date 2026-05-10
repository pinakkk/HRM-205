"use client";

import { useState } from "react";
import {
  Trophy,
  TrendingUp,
  Users,
  BarChart3,
  RefreshCw,
  Download,
  Medal,
  ChevronUp,
  ChevronDown,
  Target,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MonthlyTopPerformer() {
  const topEmployee = {
    name: "Sarah Chen",
    dept: "Design",
    points: 4850,
    growth: "+24%",
    avatar: "S",
    achievements: ["Employee of Month", "Top Innovator"]
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 text-white shadow-xl">
      <div className="absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-white/5 blur-3xl"></div>
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-400">
            <Trophy className="h-6 w-6" />
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Monthly Top Performer
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-3xl bg-neutral-700 flex items-center justify-center text-3xl font-bold border-4 border-amber-400/30">
            {topEmployee.avatar}
          </div>
          <div>
            <h3 className="text-2xl font-black">{topEmployee.name}</h3>
            <p className="text-neutral-400 font-medium">{topEmployee.dept} Department</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topEmployee.achievements.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-400/20">
                  <Medal className="h-3 w-3" /> {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
            <p className="text-[10px] font-bold text-neutral-500 uppercase">Current Points</p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-black">{topEmployee.points.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-emerald-400 mb-1 flex items-center">
                <TrendingUp className="h-3 w-3" /> {topEmployee.growth}
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
            <p className="text-[10px] font-bold text-neutral-500 uppercase">Rank Progress</p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-black">#1</span>
              <span className="text-[10px] font-bold text-neutral-400 mb-1">Global</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GenerateRankingsControl() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-neutral-900">Rankings Control</h3>
        <p className="text-xs text-neutral-500">Recalculate leaderboard positions and rewards</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-neutral-400 border border-neutral-100">
              <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">Auto-Update</p>
              <p className="text-[10px] text-neutral-500">Last updated: 15m ago</p>
            </div>
          </div>
          <div className="h-6 w-10 rounded-full bg-emerald-500 relative cursor-pointer">
            <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm"></div>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:bg-neutral-300 disabled:shadow-none"
        >
          {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Generate New Rankings
        </button>

        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all">
          <Download className="h-4 w-4" />
          Export Leaderboard (CSV)
        </button>
      </div>
    </div>
  );
}

export function DepartmentComparison() {
  const depts = [
    { name: "Engineering", score: 92, trend: "up", color: "bg-blue-500" },
    { name: "Design", score: 88, trend: "up", color: "bg-purple-500" },
    { name: "Marketing", score: 74, trend: "down", color: "bg-amber-500" },
    { name: "Sales", score: 81, trend: "up", color: "bg-emerald-500" },
  ];

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Department Performance</h3>
          <p className="text-xs text-neutral-500">Average points per department member</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-400">
          <BarChart3 className="h-5 w-5" />
        </div>
      </div>
      <div className="space-y-6">
        {depts.map((d, i) => (
          <div key={i}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">{d.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-neutral-900">{d.score} pts</span>
                {d.trend === "up" ? (
                  <ChevronUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-rose-500" />
                )}
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100">
              <div className={cn("h-full rounded-full transition-all duration-1000", d.color)} style={{ width: `${d.score}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FullLeaderboard() {
  const employees = [
    { rank: 1, name: "Sarah Chen", dept: "Design", points: 4850, change: "up" },
    { rank: 2, name: "Alex Rivera", dept: "Engineering", points: 4620, change: "up" },
    { rank: 3, name: "James Wilson", dept: "Marketing", points: 4100, change: "down" },
    { rank: 4, name: "Maria Garcia", dept: "Product", points: 3950, change: "up" },
    { rank: 5, name: "David Kim", dept: "Sales", points: 3820, change: "down" },
  ];

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-50 p-6">
        <h3 className="text-lg font-bold text-neutral-900">Global Leaderboard</h3>
        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium focus:outline-none">
            <option>All Time</option>
            <option>This Month</option>
            <option>This Week</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Points</th>
              <th className="px-6 py-4 text-right">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {employees.map((emp) => (
              <tr key={emp.rank} className="group hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black",
                    emp.rank === 1 ? "bg-amber-400 text-amber-900" :
                      emp.rank === 2 ? "bg-slate-200 text-slate-700" :
                        emp.rank === 3 ? "bg-orange-200 text-orange-700" : "bg-neutral-100 text-neutral-500"
                  )}>
                    {emp.rank}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                      {emp.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-neutral-900">{emp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{emp.dept}</td>
                <td className="px-6 py-4 text-sm font-black text-neutral-900">{emp.points.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  {emp.change === "up" ? (
                    <div className="inline-flex items-center text-emerald-500">
                      <ChevronUp className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center text-rose-500">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
