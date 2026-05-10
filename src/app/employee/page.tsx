import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";
import { levelFromPoints, progressToNext } from "@/lib/gamification";
import { currentStreak, attendancePercent } from "@/lib/streaks";
import {
  BadgeDollarSign,
  Briefcase,
  Clock,
  Crown,
  Flame,
  Megaphone,
  Sparkles,
  Trophy,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboard() {
  const me = await requireUser();
  const supabase = await createClient();

  const since60 = new Date(Date.now() - 60 * 86400_000).toISOString();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [{ data: balance }, { data: recent }, { data: att }, { data: ann }, { data: eotm }] =
    await Promise.all([
      supabase
        .from("points_balance")
        .select("balance, bonus_total, lifetime_total")
        .eq("user_id", me.profile.id)
        .maybeSingle(),
      supabase
        .from("rewards_ledger")
        .select("id, kind, amount, reason, created_at")
        .eq("user_id", me.profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("attendance")
        .select("check_in")
        .eq("user_id", me.profile.id)
        .gte("check_in", since60),
      supabase
        .from("announcements")
        .select("id, title, body, published_at")
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(3),
      supabase
        .from("employee_of_month")
        .select("user_id, reason")
        .eq("year", year)
        .eq("month", month)
        .maybeSingle(),
    ]);

  const checkIns = (att ?? []).map((a) => a.check_in);
  const streak = currentStreak(checkIns);
  const pct = attendancePercent(checkIns, 30);
  const lifetime = Number(balance?.lifetime_total ?? 0);
  const level = levelFromPoints(lifetime);
  const progress = Math.round(progressToNext(lifetime) * 100);
  const isEotm = eotm?.user_id === me.profile.id;

  const eotmName = eotm
    ? (await supabase.from("users").select("full_name").eq("id", eotm.user_id).single()).data?.full_name ?? null
    : null;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Welcome back, {me.profile.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-neutral-500">Here's your day at a glance.</p>
      </div>

      {isEotm && (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 text-amber-900 shadow-sm dark:border-amber-900/40 dark:from-amber-900/20 dark:to-yellow-900/20 dark:text-amber-100">
          <div className="flex items-center gap-3">
            <Crown className="h-7 w-7 text-amber-500" />
            <div>
              <div className="font-extrabold">You're Employee of the Month!</div>
              <div className="text-xs">{eotm?.reason ?? "Recognised by HR for outstanding contribution."}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Points balance"
          value={formatPoints(Number(balance?.balance ?? 0))}
          icon={<BadgeDollarSign className="h-5 w-5" />}
        />
        <Stat
          label="Bonus YTD"
          value={`₹${formatPoints(Number(balance?.bonus_total ?? 0))}`}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <Stat label="Attendance (30d)" value={`${pct}%`} icon={<Clock className="h-5 w-5" />} />
        <Stat label="Streak" value={`${streak} days`} icon={<Flame className="h-5 w-5" />} accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 dark:border-indigo-900/40 dark:from-indigo-900/20 dark:to-neutral-900">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-bold">Your level</h3>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-indigo-700 dark:text-indigo-200">{level.tier}</div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/60 dark:bg-indigo-950/60">
            <div className="h-full bg-indigo-600" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
            {level.next ? `${level.next - lifetime} pts to next tier` : "Top tier — keep going to stay there"}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white">Recent rewards</h3>
            <Link href="/employee/rewards" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          {recent && recent.length > 0 ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-semibold text-neutral-900 dark:text-white truncate capitalize">{r.reason}</div>
                    <div className="text-[11px] text-neutral-500">
                      {r.kind} · {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${Number(r.amount) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {Number(r.amount) >= 0 ? "+" : ""}
                    {r.amount}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-12 text-center text-sm text-neutral-500">No rewards yet — your first one is coming.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <Megaphone className="h-4 w-4 text-amber-500" /> Announcements
            </h3>
          </div>
          {ann && ann.length > 0 ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {ann.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <div className="font-semibold text-neutral-900 dark:text-white">{a.title}</div>
                  <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">{a.body}</p>
                  <div className="mt-1 text-[10px] text-neutral-500">{new Date(a.published_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-neutral-500">No announcements yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-neutral-900 dark:text-white">Employee of the Month</h3>
          </div>
          {eotmName ? (
            <div className="mt-3">
              <div className="text-xl font-extrabold text-neutral-900 dark:text-white">{eotmName}</div>
              {eotm?.reason && (
                <p className="mt-1 text-sm italic text-neutral-600 dark:text-neutral-400">"{eotm.reason}"</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">HR hasn't announced this month yet.</p>
          )}
          <Link
            href="/employee/leaderboard"
            className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            See full leaderboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "amber";
}) {
  const accents = {
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
  };
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:bg-neutral-900 dark:border-neutral-800">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${accent ? accents[accent] : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300"}`}>
        {icon}
      </div>
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
      <div className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">{value}</div>
    </div>
  );
}
