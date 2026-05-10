import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LeaveDecisionRow } from "./leave-row";
import { QrPoster } from "./qr-poster";
import { Users, CalendarCheck, AlertTriangle, CalendarRange } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  await requireAdmin();
  const supabase = await createClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const since30 = new Date(Date.now() - 30 * 86400_000);

  const [employeesRes, todayRes, monthRes, pendingLeavesRes, recentLeavesRes] = await Promise.all([
    supabase.from("users").select("id, full_name, department").eq("role", "employee"),
    supabase
      .from("attendance")
      .select("user_id")
      .gte("check_in", startOfDay.toISOString()),
    supabase
      .from("attendance")
      .select("user_id, check_in, source")
      .gte("check_in", since30.toISOString()),
    supabase
      .from("leaves")
      .select("id, user_id, start_date, end_date, type, reason, created_at, status")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("leaves")
      .select("id, user_id, start_date, end_date, type, status")
      .neq("status", "pending")
      .order("decided_at", { ascending: false })
      .limit(8),
  ]);

  const employees = employeesRes.data ?? [];
  const presentTodayIds = new Set((todayRes.data ?? []).map((r) => r.user_id));
  const presentToday = presentTodayIds.size;
  const totalEmps = employees.length;

  // Late arrivals (this week, after 10:30 local)
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  let lateThisWeek = 0;
  for (const r of monthRes.data ?? []) {
    const d = new Date(r.check_in);
    if (d < thisWeekStart) continue;
    if (d.getHours() > 10 || (d.getHours() === 10 && d.getMinutes() > 30)) lateThisWeek += 1;
  }

  const userMap = new Map(employees.map((e) => [e.id, e.full_name]));

  const pendingLeaves = (pendingLeavesRes.data ?? []).map((l) => ({
    ...l,
    name: userMap.get(l.user_id) ?? "Unknown",
  }));
  const recentLeaves = (recentLeavesRes.data ?? []).map((l) => ({
    ...l,
    name: userMap.get(l.user_id) ?? "Unknown",
  }));

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Attendance Management</h1>
        <p className="text-sm text-neutral-500">Daily presence, leave approvals, late arrivals, QR poster.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total employees" value={String(totalEmps)} icon={<Users className="h-5 w-5" />} />
        <Stat label="Present today" value={`${presentToday} / ${totalEmps}`} icon={<CalendarCheck className="h-5 w-5" />} accent="emerald" />
        <Stat label="Late this week" value={String(lateThisWeek)} icon={<AlertTriangle className="h-5 w-5" />} accent="amber" />
        <Stat label="Pending leaves" value={String(pendingLeaves.length)} icon={<CalendarRange className="h-5 w-5" />} accent={pendingLeaves.length ? "amber" : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white">Pending leave requests</h3>
            <span className="text-xs text-neutral-500">{pendingLeaves.length} awaiting decision</span>
          </div>
          {pendingLeaves.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-neutral-500">No pending requests.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {pendingLeaves.map((l) => (
                <LeaveDecisionRow key={l.id} leave={l} />
              ))}
            </ul>
          )}
        </div>

        <div>
          <QrPoster />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
        <div className="border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-900 dark:text-white">Recent leave decisions</h3>
        </div>
        {recentLeaves.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-neutral-500">No recent decisions.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentLeaves.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">{l.name}</div>
                  <div className="text-[11px] text-neutral-500 capitalize">
                    {l.type} · {l.start_date} → {l.end_date}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    l.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                  }`}
                >
                  {l.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: "emerald" | "amber" }) {
  const accents = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
  };
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:bg-neutral-900 dark:border-neutral-800">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${accent ? accents[accent] : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300"}`}>
        {icon}
      </div>
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
      <div className="text-xl font-extrabold text-neutral-900 dark:text-white">{value}</div>
    </div>
  );
}
