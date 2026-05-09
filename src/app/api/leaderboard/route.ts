import { createClient } from "@/lib/supabase/server";
import { cacheGet, cacheKeys, cacheSet } from "@/lib/redis";
import { ok, problem } from "@/lib/http";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") ?? "company";
  const period = url.searchParams.get("period") ?? "all";

  const cacheKey = cacheKeys.leaderboard(scope, period);
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) return ok({ source: "cache", data: cached });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data, error } = await supabase
    .from("leaderboard")
    .select("user_id, full_name, department, balance, bonus_total")
    .order("balance", { ascending: false })
    .limit(50);

  if (error) return problem(500, "Query failed", error.message);

  await cacheSet(cacheKey, data, 60);
  return ok({ source: "db", data });
}
