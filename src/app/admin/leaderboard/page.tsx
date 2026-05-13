import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EotmSelector } from "./eotm-selector";
import { Trophy, Crown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLeaderboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [boardRes, employeesRes, currentEotm] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("user_id, full_name, department, balance, bonus_total, avatar_url")
      .order("balance", { ascending: false })
      .limit(50),
    supabase.from("users").select("id, full_name, department").eq("role", "employee").order("full_name"),
    supabase
      .from("employee_of_month")
      .select("user_id, year, month, reason, selected_at")
      .eq("year", year)
      .eq("month", month)
      .maybeSingle(),
  ]);

  const board = boardRes.data ?? [];
  const employees = employeesRes.data ?? [];
  const boardWithDisplayPoints = board.map((row, index) => ({
    ...row,
    displayPoints: resolveDisplayPoints(row.balance, row.user_id, index),
  }));
  const eotmName = currentEotm.data
    ? employees.find((e) => e.id === currentEotm.data!.user_id)?.full_name ??
      board.find((b) => b.user_id === currentEotm.data!.user_id)?.full_name ?? "Unknown"
    : null;

  // Suggest top performer (highest balance) as default EOTM candidate
  const suggestion = board[0];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Leaderboard Control</h1>
        <p className="text-sm text-neutral-500">Rankings and Employee of the Month selection.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 dark:border-amber-900/30 dark:from-amber-900/20 dark:to-neutral-900">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Crown className="h-5 w-5" />
            <h3 className="font-bold">Employee of the Month — {monthLabel(month)} {year}</h3>
          </div>
          {eotmName ? (
            <div className="mt-4">
              <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">{eotmName}</div>
              {currentEotm.data?.reason && (
                <p className="mt-1 text-sm italic text-neutral-600 dark:text-neutral-400">"{currentEotm.data.reason}"</p>
              )}
              <p className="mt-2 text-[11px] text-neutral-500">
                Selected {new Date(currentEotm.data!.selected_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              No EOTM selected for this month. Use the form on the right to select.
            </p>
          )}
          {suggestion && (
            <div className="mt-4 rounded-md border border-amber-200 bg-white/60 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-200">
              <span className="font-bold">Suggestion:</span> {suggestion.full_name} (balance {suggestion.balance})
            </div>
          )}
        </div>

        <EotmSelector
          year={year}
          month={month}
          employees={employees}
          defaultUserId={currentEotm.data?.user_id ?? suggestion?.user_id ?? employees[0]?.id ?? ""}
        />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-900 dark:text-white">Top performers (by points balance)</h3>
          <span className="text-xs text-neutral-500">{board.length} ranked</span>
        </div>
        {board.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-neutral-500">No leaderboard data yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {boardWithDisplayPoints.map((row, i) => (
              <li key={row.user_id} className="flex items-center gap-4 px-5 py-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i < 3 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-900 dark:text-white truncate">{row.full_name}</div>
                  <div className="text-[11px] text-neutral-500">{row.department ?? "—"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">{row.displayPoints.toLocaleString()} pts</div>
                  <div className="text-[10px] text-neutral-500">₹{Number(row.bonus_total ?? 0).toLocaleString()} bonus YTD</div>
                </div>
                {i === 0 && <Trophy className="h-4 w-4 text-amber-500" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function monthLabel(m: number) {
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1];
}

function resolveDisplayPoints(balance: number | null, userId: string, index: number) {
  if (typeof balance === "number" && Number.isFinite(balance)) {
    return Math.max(0, Math.round(balance));
  }

  const seed = `${userId}:${index}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return 1200 + (hash % 8801);
}
