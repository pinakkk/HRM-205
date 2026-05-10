import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";
import { KPIChart, AttendanceChart } from "@/components/employee/DashboardCharts";
import {
  Users,
  Clock,
  Briefcase,
  MoreHorizontal,
  Plus,
  CheckCircle2,
} from "lucide-react";

export default async function EmployeeDashboard() {
  const me = await requireUser();
  const supabase = await createClient();

  const { data: balance } = await supabase
    .from("points_balance")
    .select("balance, bonus_total, lifetime_total")
    .eq("user_id", me.profile.id)
    .maybeSingle();

  const { data: recent } = await supabase
    .from("rewards_ledger")
    .select("id, kind, amount, reason, created_at")
    .eq("user_id", me.profile.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section (Minimal since TopBar is present) */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Good Morning, {me.profile.full_name.split(" ")[0]}</h1>
        <p className="text-sm text-neutral-500">Start your day with a quick overview of your progress ({today})</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Points balance"
          value={formatPoints(balance?.balance ?? 0)}
          icon={<Users className="h-5 w-5" />}
          trend="+ 05% from last month"
          trendColor="text-green-600"
        />
        <StatCard
          label="Bonus this year"
          value={`₹${formatPoints(balance?.bonus_total ?? 0)}`}
          icon={<Briefcase className="h-5 w-5" />}
          trend="+ 03% from last month"
          trendColor="text-green-600"
        />
        <StatCard
          label="Lifetime points"
          value={formatPoints(balance?.lifetime_total ?? 0)}
          icon={<Clock className="h-5 w-5" />}
          trend="+ 02% from last month"
          trendColor="text-green-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 lg:col-span-2 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              KPI Metrics
            </h3>
            <select className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium focus:outline-none dark:bg-neutral-800 dark:border-neutral-700">
              <option>Last 6 months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <KPIChart />
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              Attendance Summary
            </h3>
            <select className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium focus:outline-none dark:bg-neutral-800 dark:border-neutral-700">
              <option>Today</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <AttendanceChart />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Things To Do */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 lg:col-span-2 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <CheckCircle2 className="h-5 w-5 text-neutral-400" /> Things To Do
            </h3>
            <button className="flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800">
              <Plus className="h-3 w-3" /> New task
            </button>
          </div>
          <div className="space-y-4">
            {recent?.length ? (
              recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-4 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" className="h-5 w-5 rounded border-neutral-300 text-indigo-600 dark:border-neutral-700 dark:bg-neutral-800" />
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 capitalize dark:text-white">{r.reason}</h4>
                      <p className="text-xs text-neutral-500">Reward type: {r.kind}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">Today</div>
                    <div className="text-xs font-medium text-neutral-500">+{r.amount} pts</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-neutral-500">No tasks or recent activities found.</p>
            )}
          </div>
        </div>

        {/* Who's Away */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <Users className="h-5 w-5 text-neutral-400" /> Who&apos;s Away
            </h3>
            <button className="text-neutral-400 hover:text-neutral-600">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          <p className="mb-4 text-xs font-bold text-neutral-500">4 Employees <span className="font-normal">Updated 8:15 / 21 May 2025</span></p>
          <div className="space-y-4">
            <AwayEmployee name="Abigail Noto" date="21 - 26 May 2025" status="On Leave" />
            <AwayEmployee name="Gina Kinaya" date="21 May 2025" status="On Leave" />
            <AwayEmployee name="Jeje" date="21 May 2025" status="On Leave" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend, trendColor }: { label: string; value: string; icon: React.ReactNode; trend: string; trendColor: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {icon}
        </div>
        <button className="text-neutral-400 hover:text-neutral-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="text-sm font-semibold text-neutral-500">{label}</div>
      <div className="mt-1 flex items-end gap-3">
        <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">{value}</div>
      </div>
      <div className={`mt-2 text-xs font-bold ${trendColor} flex items-center gap-1`}>
        <TrendingUpIcon className="h-3 w-3" /> {trend}
      </div>
    </div>
  );
}

function AwayEmployee({ name, date, status }: { name: string; date: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-400">
            {name.charAt(0)}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{name}</h4>
          <p className="text-[10px] text-neutral-500">{date}</p>
        </div>
      </div>
      <div className="rounded-full bg-neutral-50 px-3 py-1 text-[10px] font-bold text-neutral-600 border border-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
        {status}
      </div>
    </div>
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
