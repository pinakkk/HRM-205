import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { 
  // PayrollHistoryChart, 
  // RequestsChart 
} from "@/components/admin/AdminCharts";
import { 
  Users, 
  Wallet, 
  Calculator, 
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Star,
  Trophy,
  Award,
  Sparkles,
  Zap,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminOverview() {
  const me = await requireAdmin();
  const supabase = await createClient();

  const [{ count: userCount }, { count: pendingRedemptions }, { data: recentUsers }] =
    await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase
        .from("redemptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("users")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Good Morning, {me.profile.full_name.split(" ")[0]}</h1>
        <p className="text-sm text-neutral-500">Start your day with a quick overview of your progress ({today})</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={userCount ?? 0}
          trend="+3.4% last month"
          trendUp={true}
          icon={<Users className="h-5 w-5 text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Average Salary"
          value="$3,256"
          trend="-2.83% last month"
          trendUp={false}
          icon={<Wallet className="h-5 w-5 text-rose-600" />}
          bgColor="bg-rose-50"
        />
        <StatCard
          label="Total Outstanding"
          value="$89,235"
          trend="+2.84% last month"
          trendUp={true}
          icon={<Calculator className="h-5 w-5 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Recent Awards"
          value="24"
          trend="+8 this week"
          trendUp={true}
          icon={<Award className="h-5 w-5 text-orange-600" />}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Attendance Overview</h3>
              <p className="text-xs text-neutral-500">Real-time presence of employees today</p>
            </div>
            <Link href="/admin/attendance" className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50">
              Manage Attendance
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-[10px] font-bold text-emerald-600 uppercase">Present</p>
              <p className="text-xl font-black text-emerald-900">142</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-[10px] font-bold text-blue-600 uppercase">On Leave</p>
              <p className="text-xl font-black text-blue-900">12</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-[10px] font-bold text-amber-600 uppercase">Late</p>
              <p className="text-xl font-black text-amber-900">08</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-4">
              <p className="text-[10px] font-bold text-rose-600 uppercase">Absent</p>
              <p className="text-xl font-black text-rose-900">05</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-neutral-50 pt-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <p className="text-xs font-medium text-neutral-500">High attendance rate this week (94%)</p>
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase">Updated 5m ago</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900">Recent Feedback</h3>
            <Link href="/admin/feedback" className="text-xs font-bold text-red-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { name: "Sarah Chen", rating: 5, time: "2h ago" },
              { name: "James Wilson", rating: 4, time: "5h ago" },
              { name: "Alex Rivera", rating: 5, time: "Yesterday" },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{f.name}</p>
                    <p className="text-[10px] text-neutral-400">{f.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-neutral-700">{f.rating}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full rounded-xl bg-neutral-50 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-all">
            Provide New Feedback
          </button>
        </div>
      </div>

      {/* Performance Spotlight Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900">Department Performance</h3>
            <Link href="/admin/leaderboard" className="text-xs font-bold text-red-600 hover:underline">
              Full Comparison
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { name: "Engineering", score: 92, color: "bg-blue-500" },
              { name: "Design", score: 88, color: "bg-purple-500" },
              { name: "Marketing", score: 74, color: "bg-amber-500" },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-24 text-xs font-bold text-neutral-600">{d.name}</span>
                <div className="h-2 flex-1 rounded-full bg-neutral-50">
                  <div className={cn("h-full rounded-full", d.color)} style={{ width: `${d.score}%` }}></div>
                </div>
                <span className="text-xs font-black text-neutral-900">{d.score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900">Monthly Top Performers</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="relative h-16 w-16 rounded-full border-4 border-amber-400 p-1">
                <div className="h-full w-full rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-500">
                  S
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-400 flex items-center justify-center border-2 border-white">
                  <Trophy className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-xs font-bold text-neutral-900">Sarah Chen</p>
              <p className="text-[10px] text-neutral-400">Design</p>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="rounded-xl bg-neutral-50 p-3">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Points Earned</p>
                <p className="text-lg font-black text-neutral-900">4,850</p>
              </div>
              <button className="w-full rounded-xl bg-neutral-900 py-2 text-[10px] font-bold text-white hover:bg-neutral-800 transition-all">
                Generate Rewards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Spotlight Section */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Badge Distribution</h3>
            <p className="text-xs text-neutral-500">Most awarded achievements this month</p>
          </div>
          <Link href="/admin/badges" className="text-xs font-bold text-red-600 hover:underline">
            Manage Badges
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { name: "Top Innovator", count: 12, rarity: "platinum", icon: <Sparkles className="h-4 w-4" /> },
            { name: "Early Bird", count: 45, rarity: "silver", icon: <Zap className="h-4 w-4" /> },
            { name: "Team Player", count: 28, rarity: "gold", icon: <Users className="h-4 w-4" /> },
            { name: "Reliable", count: 89, rarity: "bronze", icon: <ShieldCheck className="h-4 w-4" /> },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center justify-center rounded-2xl bg-neutral-50 p-6 border border-neutral-100 hover:border-red-100 transition-all">
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center mb-3",
                b.rarity === "platinum" ? "bg-indigo-50 text-indigo-600" :
                b.rarity === "gold" ? "bg-amber-50 text-amber-600" :
                b.rarity === "silver" ? "bg-slate-50 text-slate-600" : "bg-orange-50 text-orange-600"
              )}>
                {b.icon}
              </div>
              <p className="text-xs font-bold text-neutral-900">{b.name}</p>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">{b.count} Awarded</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Employees Table */}
      <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-50 p-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-neutral-900">Recent</h3>
            <span className="text-xs font-medium text-neutral-400">{userCount} Employees</span>
          </div>
          <select className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium focus:outline-none">
            <option>All Department</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {recentUsers?.map((user) => (
                <tr key={user.id} className="group hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-100">
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-400">
                          {user.full_name?.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900">{user.full_name}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">Operations</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-neutral-400 hover:text-neutral-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  trend, 
  trendUp, 
  icon, 
  bgColor 
}: { 
  label: string; 
  value: string | number; 
  trend: string; 
  trendUp: boolean; 
  icon: React.ReactNode; 
  bgColor: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bgColor}`}>
          {icon}
        </div>
        {trendUp ? (
          <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
            <ArrowUpRight className="h-3 w-3" /> {trend.split(' ')[0]}
          </div>
        ) : (
          <div className="flex items-center gap-0.5 text-xs font-bold text-rose-600">
            <ArrowDownRight className="h-3 w-3" /> {trend.split(' ')[0]}
          </div>
        )}
      </div>
      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{label}</p>
      <div className="mt-1 text-2xl font-black text-neutral-900">{value}</div>
      <p className="mt-1 text-[10px] font-medium text-neutral-400">{trend.split(' ').slice(1).join(' ')}</p>
    </div>
  );
}
