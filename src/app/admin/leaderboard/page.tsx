import { requireAdmin } from "@/lib/auth";
import { 
  MonthlyTopPerformer, 
  GenerateRankingsControl, 
  DepartmentComparison, 
  FullLeaderboard 
} from "./leaderboard-admin-components";
import { Bell, Trophy, Search, Filter } from "lucide-react";

export default async function AdminLeaderboardPage() {
  const me = await requireAdmin();
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Leaderboard Control</h1>
          <p className="text-sm text-neutral-500">Manage rankings, evaluate performance, and generate monthly rewards ({today})</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm">
            <Bell className="h-5 w-5" />
          </button>
          <button className="flex h-10 px-4 items-center justify-center gap-2 rounded-xl bg-neutral-900 text-sm font-bold text-white hover:bg-neutral-800 shadow-lg shadow-neutral-200">
            <Trophy className="h-4 w-4" />
            <span>Grand Finale</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Highlight */}
        <div className="lg:col-span-2">
          <MonthlyTopPerformer />
        </div>

        {/* Control Sidebar */}
        <div className="flex flex-col gap-6">
          <GenerateRankingsControl />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Full Leaderboard Table */}
        <div className="lg:col-span-2">
          <FullLeaderboard />
        </div>

        {/* Department Metrics */}
        <div className="flex flex-col gap-6">
          <DepartmentComparison />
        </div>
      </div>
    </div>
  );
}
