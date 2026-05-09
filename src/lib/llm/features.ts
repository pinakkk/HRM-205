import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type EmployeeFeatures = {
  user_id: string;
  full_name: string;
  attendance_pct: number;
  kpi_score: number;
  peer_sentiment: number;
  tenure_months: number;
};

const WINDOW_DAYS = 90;
const WORKING_DAYS_PER_MONTH = 22;

type Employee = { id: string; full_name: string; joined_at: string };

export async function computeEmployeeFeatures(
  client: SupabaseClient<Database>,
  employees: Employee[],
): Promise<EmployeeFeatures[]> {
  if (employees.length === 0) return [];

  const userIds = employees.map((e) => e.id);
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [attendanceRes, kpiRes, feedbackRes] = await Promise.all([
    client
      .from("attendance")
      .select("user_id, check_in")
      .in("user_id", userIds)
      .gte("check_in", since),
    client
      .from("kpi_assignments")
      .select("user_id, target, achieved")
      .in("user_id", userIds),
    client
      .from("feedback")
      .select("to_user_id, sentiment_score")
      .in("to_user_id", userIds)
      .not("sentiment_score", "is", null),
  ]);

  const attendanceByUser = new Map<string, Set<string>>();
  for (const row of attendanceRes.data ?? []) {
    const day = String(row.check_in).slice(0, 10);
    if (!attendanceByUser.has(row.user_id)) attendanceByUser.set(row.user_id, new Set());
    attendanceByUser.get(row.user_id)!.add(day);
  }

  const kpiByUser = new Map<string, { sum: number; count: number }>();
  for (const row of kpiRes.data ?? []) {
    const target = Number(row.target ?? 0);
    const achieved = Number(row.achieved ?? 0);
    if (target <= 0) continue;
    const pct = Math.max(0, Math.min(100, (achieved / target) * 100));
    const agg = kpiByUser.get(row.user_id) ?? { sum: 0, count: 0 };
    agg.sum += pct;
    agg.count += 1;
    kpiByUser.set(row.user_id, agg);
  }

  const feedbackByUser = new Map<string, { sum: number; count: number }>();
  for (const row of feedbackRes.data ?? []) {
    if (row.sentiment_score === null) continue;
    const score = Number(row.sentiment_score);
    const agg = feedbackByUser.get(row.to_user_id) ?? { sum: 0, count: 0 };
    agg.sum += score;
    agg.count += 1;
    feedbackByUser.set(row.to_user_id, agg);
  }

  const expectedDays = Math.round((WINDOW_DAYS / 30) * WORKING_DAYS_PER_MONTH);

  return employees.map((e) => {
    const days = attendanceByUser.get(e.id)?.size ?? 0;
    const attendance_pct = expectedDays === 0 ? 0 : Math.min(100, (days / expectedDays) * 100);

    const kpi = kpiByUser.get(e.id);
    const kpi_score = kpi && kpi.count > 0 ? kpi.sum / kpi.count : 0;

    const fb = feedbackByUser.get(e.id);
    const peer_sentiment = fb && fb.count > 0 ? fb.sum / fb.count : 0;

    return {
      user_id: e.id,
      full_name: e.full_name,
      attendance_pct: round(attendance_pct, 1),
      kpi_score: round(kpi_score, 1),
      peer_sentiment: round(peer_sentiment, 2),
      tenure_months: monthsSince(e.joined_at),
    };
  });
}

function round(n: number, digits: number) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function monthsSince(iso: string) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return 0;
  return Math.max(0, Math.round((Date.now() - then) / (1000 * 60 * 60 * 24 * 30)));
}
