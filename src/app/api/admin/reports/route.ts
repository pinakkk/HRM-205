import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

type WeekdayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
const WEEKDAYS: WeekdayKey[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type ReportsData = {
  rangeDays: number;
  attendanceByWeekday: { day: WeekdayKey; presenceRate: number }[];
  performanceByDepartment: { department: string; avgScore: number; people: number }[];
  badgeDistribution: { rarity: "platinum" | "gold" | "silver" | "bronze"; count: number }[];
  totals: {
    totalBadges: number;
    totalEmployees: number;
    topDepartment: string | null;
    topDeptScore: number;
  };
  generatedAt: string;
};

export async function GET(req: Request) {
  await requireAdmin();
  const supabase = await createClient();
  const url = new URL(req.url);
  const rangeDays = Math.min(180, Math.max(7, Number(url.searchParams.get("range") ?? 30)));

  const since = new Date(Date.now() - rangeDays * 86400_000);
  const sinceIso = since.toISOString();

  const [usersRes, attendanceRes, kpiRes, badgesRes, userBadgesRes] = await Promise.all([
    supabase.from("users").select("id, department"),
    supabase.from("attendance").select("user_id, check_in").gte("check_in", sinceIso),
    supabase
      .from("kpi_assignments")
      .select("user_id, target, achieved, kpis(weight)")
      .gte("created_at", sinceIso),
    supabase.from("badges").select("id, rarity"),
    supabase.from("user_badges").select("badge_id, awarded_at").gte("awarded_at", sinceIso),
  ]);

  const users = usersRes.data ?? [];
  const totalEmployees = users.length;
  const deptByUser = new Map<string, string | null>(users.map((u) => [u.id, u.department]));

  const presentByDow = new Map<number, Set<string>>();
  for (let i = 0; i < 7; i++) presentByDow.set(i, new Set());
  const distinctDatesByDow = new Map<number, Set<string>>();
  for (let i = 0; i < 7; i++) distinctDatesByDow.set(i, new Set());

  for (const row of attendanceRes.data ?? []) {
    const d = new Date(row.check_in);
    const dow = d.getDay();
    const dateKey = d.toISOString().slice(0, 10);
    distinctDatesByDow.get(dow)?.add(dateKey);
    presentByDow.get(dow)?.add(`${dateKey}|${row.user_id}`);
  }

  const attendanceByWeekday = WEEKDAYS.map((label, dow) => {
    const dates = distinctDatesByDow.get(dow)?.size ?? 0;
    const presences = presentByDow.get(dow)?.size ?? 0;
    const denom = dates * Math.max(1, totalEmployees);
    return {
      day: label,
      presenceRate: denom === 0 ? 0 : Math.round((presences / denom) * 100),
    };
  });

  type DeptAgg = { score: number; weight: number; users: Set<string> };
  const deptAgg = new Map<string, DeptAgg>();
  for (const row of (kpiRes.data ?? []) as unknown as Array<{
    user_id: string;
    target: number | null;
    achieved: number | null;
    kpis: { weight: number } | null;
  }>) {
    const target = Number(row.target ?? 0);
    if (target <= 0) continue;
    const dept = deptByUser.get(row.user_id) ?? "Unassigned";
    const weight = Number(row.kpis?.weight ?? 1);
    const ratio = Math.min(1, Number(row.achieved ?? 0) / target);
    const agg = deptAgg.get(dept) ?? { score: 0, weight: 0, users: new Set<string>() };
    agg.score += ratio * weight;
    agg.weight += weight;
    agg.users.add(row.user_id);
    deptAgg.set(dept, agg);
  }
  const performanceByDepartment = Array.from(deptAgg.entries())
    .map(([department, a]) => ({
      department,
      avgScore: a.weight === 0 ? 0 : Math.round((a.score / a.weight) * 100),
      people: a.users.size,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const rarityById = new Map<string, "platinum" | "gold" | "silver" | "bronze">();
  for (const b of badgesRes.data ?? []) {
    if (b.rarity) rarityById.set(b.id, b.rarity);
  }
  const rarityCount: Record<"platinum" | "gold" | "silver" | "bronze", number> = {
    platinum: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
  };
  for (const ub of userBadgesRes.data ?? []) {
    const r = rarityById.get(ub.badge_id);
    if (r) rarityCount[r] += 1;
  }
  const badgeDistribution = (["platinum", "gold", "silver", "bronze"] as const).map((rarity) => ({
    rarity,
    count: rarityCount[rarity],
  }));

  const top = performanceByDepartment[0];
  const totalBadges = userBadgesRes.data?.length ?? 0;

  const payload: ReportsData = {
    rangeDays,
    attendanceByWeekday,
    performanceByDepartment,
    badgeDistribution,
    totals: {
      totalBadges,
      totalEmployees,
      topDepartment: top?.department ?? null,
      topDeptScore: top?.avgScore ?? 0,
    },
    generatedAt: new Date().toISOString(),
  };

  return ok<ReportsData>(payload);
}
