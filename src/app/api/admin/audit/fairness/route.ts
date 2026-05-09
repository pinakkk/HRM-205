import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";
import {
  anovaF,
  managerSkew,
  pairwiseDIR,
  type GroupedRewards,
} from "@/lib/audit/disparate-impact";
import { cacheGet, cacheKeys, cacheSet } from "@/lib/redis";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return problem(403, "Admin only");

  const cached = await cacheGet<unknown>(cacheKeys.auditSummary());
  if (cached) return ok({ source: "cache", data: cached });

  const admin = createAdminClient();

  // Pull rewards joined with user attributes.
  const { data: rows, error } = await admin
    .from("rewards_ledger")
    .select("amount, kind, user_id, users(gender, department)")
    .eq("kind", "bonus")
    .limit(5000);
  if (error) return problem(500, "Query failed", error.message);

  const byGender: GroupedRewards = {};
  const byDept: GroupedRewards = {};
  for (const r of rows ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = (r.users as any) ?? {};
    if (u.gender) (byGender[u.gender] ??= []).push(Number(r.amount));
    if (u.department) (byDept[u.department] ??= []).push(Number(r.amount));
  }

  const dirGender = pairwiseDIR(byGender);
  const dirDept = pairwiseDIR(byDept);
  const fDept = anovaF(byDept);

  // Manager skew: feedback sentiment per from_user_id.
  const { data: fb } = await admin
    .from("feedback")
    .select("from_user_id, sentiment_score")
    .not("sentiment_score", "is", null);
  const perManager: Record<string, number[]> = {};
  for (const r of fb ?? []) {
    if (r.sentiment_score === null) continue;
    (perManager[r.from_user_id] ??= []).push(Number(r.sentiment_score));
  }
  const skew = managerSkew(perManager);

  const summary = {
    disparate_impact: { gender: dirGender, department: dirDept },
    department_anova: fDept,
    manager_skew: skew,
    counts: { rows: rows?.length ?? 0 },
  };

  await cacheSet(cacheKeys.auditSummary(), summary, 3600);
  return ok({ source: "db", data: summary });
}
