import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { cacheInvalidate, cacheKeys } from "@/lib/redis";

const bodySchema = z.object({
  user_id: z.string().uuid(),
  kind: z.enum(["points", "bonus", "kudos", "badge"]),
  amount: z.number().nonnegative(),
  reason: z.string().min(3).max(500),
});

export async function POST(request: Request) {
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

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const { error } = await supabase.from("rewards_ledger").insert({
    user_id: parsed.data.user_id,
    kind: parsed.data.kind,
    amount: parsed.data.amount,
    reason: parsed.data.reason,
    source: "manual",
    awarded_by: user.id,
  });
  if (error) return problem(500, "Insert failed", error.message);

  await cacheInvalidate(
    cacheKeys.wallet(parsed.data.user_id),
    cacheKeys.leaderboard("company", "all"),
  );
  return ok({ status: "ok" });
}
