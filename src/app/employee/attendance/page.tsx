import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CheckInCard } from "./check-in-card";
import { LeaveRequestForm } from "./leave-form";
import { attendancePercent, currentStreak } from "@/lib/streaks";
import { CalendarCheck, Flame, Percent, CalendarRange } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const me = await requireUser();
  const supabase = await createClient();

  const since = new Date(Date.now() - 60 * 86400_000).toISOString();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [attRes, todayRes, leavesRes] = await Promise.all([
    supabase
      .from("attendance")
      .select("id, check_in, source")
      .eq("user_id", me.profile.id)
      .gte("check_in", since)
      .order("check_in", { ascending: false }),
    supabase
      .from("attendance")
      .select("id, check_in")
      .eq("user_id", me.profile.id)
      .gte("check_in", todayStart.toISOString())
      .limit(1),
    supabase
      .from("leaves")
      .select("id, start_date, end_date, type, status, reason, created_at")
      .eq("user_id", me.profile.id)
      .order("start_date", { ascending: false })
      .limit(10),
  ]);

  const checkIns = (attRes.data ?? []).map((r) => r.check_in);
  const streak = currentStreak(checkIns);
  const pct = attendancePercent(checkIns, 30);
  const checkedInToday = (todayRes.data ?? []).length > 0;
  const leaves = leavesRes.data ?? [];
  const leavesLoadError = leavesRes.error
    ? leavesRes.error.message ?? "Failed to load leave requests"
    : null;
  const leavesSchemaNotReady =
    (leavesLoadError?.includes("schema cache") ?? false) &&
    (leavesLoadError?.includes("public.leaves") ?? false);
  const remainingLeaves = Math.max(0, 12 - leaves.filter((l) => l.status === "approved").length);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Attendance</h1>
        <p className="text-sm text-neutral-500">Check in, view history, and manage leave.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Today" value={checkedInToday ? "Checked in" : "Not yet"} icon={<CalendarCheck className="h-5 w-5" />} />
        <Stat label="30-day attendance" value={`${pct}%`} icon={<Percent className="h-5 w-5" />} />
        <Stat label="Current streak" value={`${streak} days`} icon={<Flame className="h-5 w-5" />} accent="amber" />
        <Stat label="Leave balance" value={`${remainingLeaves} / 12`} icon={<CalendarRange className="h-5 w-5" />} />
      </div>

      <CheckInCard checkedIn={checkedInToday} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white">Recent check-ins</h3>
          </div>
          {attRes.data && attRes.data.length > 0 ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {attRes.data.slice(0, 12).map((row) => (
                <li key={row.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {new Date(row.check_in).toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500">{row.source ?? "web"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-neutral-500">No check-ins yet.</p>
          )}
        </div>

        <div className="space-y-6">
          <LeaveRequestForm />
          <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
            <div className="border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
              <h3 className="font-bold text-neutral-900 dark:text-white">My leaves</h3>
            </div>
            {leavesSchemaNotReady ? (
              <p className="px-5 py-6 text-center text-sm text-neutral-500">
                Leave requests unavailable: missing <span className="font-mono">public.leaves</span> table or privileges.
              </p>
            ) : leavesLoadError ? (
              <p className="px-5 py-6 text-center text-sm text-neutral-500">Leave requests unavailable.</p>
            ) : leaves.length > 0 ? (
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {leaves.map((l) => (
                  <li key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {l.start_date} → {l.end_date}
                      </div>
                      <div className="text-[11px] text-neutral-500 capitalize">{l.type} · {l.reason ?? "no reason"}</div>
                    </div>
                    <StatusPill status={l.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-center text-sm text-neutral-500">No leave requests.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: "amber" }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:bg-neutral-900 dark:border-neutral-800">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${accent === "amber" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300"}`}>
        {icon}
      </div>
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
      <div className="text-xl font-extrabold text-neutral-900 dark:text-white">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    rejected: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}
