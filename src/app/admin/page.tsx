import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Users,
  CalendarCheck,
  Coins,
  Inbox,
  Crown,
  Trophy,
  Megaphone,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const me = await requireAdmin();
  const supabase = await createClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [
    { count: empCount },
    { count: pendingRedemptions },
    { count: pendingLeaves },
    { data: presentToday },
    { data: monthLedger },
    { data: recentUsers },
    { data: eotm },
    { data: top },
    { data: announcements },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "employee"),
    supabase.from("redemptions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("leaves").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("attendance").select("user_id").gte("check_in", startOfDay.toISOString()),
    supabase
      .from("rewards_ledger")
      .select("kind, amount")
      .gte("created_at", since30),
    supabase
      .from("users")
      .select("id, full_name, email, department, joined_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("employee_of_month")
      .select("user_id, reason, selected_at")
      .eq("year", year)
      .eq("month", month)
      .maybeSingle(),
    supabase
      .from("leaderboard")
      .select("user_id, full_name, department, balance, bonus_total")
      .order("balance", { ascending: false })
      .limit(5),
    supabase
      .from("announcements")
      .select("id, title, body, published_at")
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  const distinctPresent = new Set((presentToday ?? []).map((p) => p.user_id)).size;
  const points30 = (monthLedger ?? [])
    .filter((r) => r.kind === "points" || r.kind === "kudos")
    .reduce((s, r) => s + Number(r.amount), 0);
  const bonus30 = (monthLedger ?? [])
    .filter((r) => r.kind === "bonus")
    .reduce((s, r) => s + Number(r.amount), 0);

  const eotmName = eotm
    ? (await supabase.from("users").select("full_name").eq("id", eotm.user_id).single()).data?.full_name ?? null
    : null;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Welcome back, {me.profile.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-neutral-500">Live overview of attendance, rewards, and activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Employees" value={String(empCount ?? 0)} icon={<Users className="h-5 w-5" />} />
        <Stat
          label="Present today"
          value={`${distinctPresent} / ${empCount ?? 0}`}
          icon={<CalendarCheck className="h-5 w-5" />}
          accent="emerald"
        />
        <Stat
          label="Pending leaves"
          value={String(pendingLeaves ?? 0)}
          icon={<Inbox className="h-5 w-5" />}
          accent={pendingLeaves ? "amber" : undefined}
        />
        <Stat
          label="Pending redemptions"
          value={String(pendingRedemptions ?? 0)}
          icon={<Coins className="h-5 w-5" />}
          accent={pendingRedemptions ? "amber" : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Stat label="Points awarded (30d)" value={points30.toLocaleString()} icon={<Coins className="h-5 w-5" />} />
        <Stat label="Bonus distributed (30d)" value={`₹${bonus30.toLocaleString()}`} icon={<Coins className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 dark:border-amber-900/30 dark:from-amber-900/20 dark:to-neutral-900">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Crown className="h-5 w-5" />
            <h3 className="font-bold">Employee of the Month</h3>
          </div>
          {eotmName ? (
            <div className="mt-3">
              <div className="text-xl font-extrabold text-neutral-900 dark:text-white">{eotmName}</div>
              {eotm?.reason && <p className="mt-1 text-sm italic text-neutral-600 dark:text-neutral-400">"{eotm.reason}"</p>}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">Not yet selected — head to Leaderboard Control to set one.</p>
          )}
          <Link href="/admin/leaderboard" className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            Manage leaderboard →
          </Link>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <Trophy className="h-4 w-4 text-amber-500" /> Top performers (live)
            </h3>
          </div>
          {(top ?? []).length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-neutral-500">No leaderboard data yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {(top ?? []).map((row, i) => (
                <li key={row.user_id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold dark:bg-neutral-800">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-900 dark:text-white truncate">{row.full_name}</div>
                    <div className="text-[11px] text-neutral-500">{row.department ?? "—"}</div>
                  </div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">{row.balance} pts</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white">Recent employees</h3>
            <Link href="/admin/users" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          {(recentUsers ?? []).length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-neutral-500">No employees yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {(recentUsers ?? []).map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {u.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-900 dark:text-white truncate">{u.full_name}</div>
                    <div className="text-[11px] text-neutral-500">{u.department ?? "—"} · joined {new Date(u.joined_at).toLocaleDateString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <Megaphone className="h-4 w-4 text-amber-500" /> Latest announcements
            </h3>
            <Link href="/admin/announcements" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Manage</Link>
          </div>
          {(announcements ?? []).length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-neutral-500">No announcements yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {(announcements ?? []).map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <div className="font-semibold text-neutral-900 dark:text-white">{a.title}</div>
                  <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">{a.body}</p>
                  <div className="mt-1 text-[10px] text-neutral-500">{new Date(a.published_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
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
  accent?: "emerald" | "amber";
}) {
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
      <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">{value}</div>
    </div>
  );
}
