import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";
import { allocationSchema } from "@/lib/llm/schemas";
import { cacheInvalidate, cacheKeys, getRedis } from "@/lib/redis";

const bodySchema = z.object({
  cycle_id: z.string().uuid(),
  allocation: allocationSchema,
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

  const { cycle_id, allocation } = parsed.data;

  const redis = getRedis();
  if (redis) {
    const idempKey = cacheKeys.idempAllocator(cycle_id);
    const claimed = await redis.set(idempKey, user.id, { nx: true, ex: 600 });
    if (!claimed) return problem(409, "Allocation already in progress for this cycle");
  }

  const admin = createAdminClient();

  // Re-validate cycle + sum once more server-side.
  const { data: cycle } = await admin
    .from("allocation_cycles")
    .select("id, pool_amount, status, label")
    .eq("id", cycle_id)
    .single();
  if (!cycle) return problem(404, "Cycle not found");
  if (cycle.status !== "draft") return problem(409, "Cycle not in draft");

  const total = allocation.allocations.reduce((s, a) => s + a.amount, 0);
  if (total > Number(cycle.pool_amount) + 0.01) {
    return problem(400, "Allocations exceed pool");
  }

  const ledgerRows = allocation.allocations.map((a) => ({
    user_id: a.user_id,
    cycle_id,
    kind: "bonus" as const,
    amount: a.amount,
    reason: a.rationale,
    source: "ai_suggested" as const,
    rationale_json: { confidence: a.confidence, rationale: a.rationale },
    awarded_by: user.id,
  }));

  const { error: ledgerErr } = await admin.from("rewards_ledger").insert(ledgerRows);
  if (ledgerErr) return problem(500, "Ledger insert failed", ledgerErr.message);

  const { error: cycleErr } = await admin
    .from("allocation_cycles")
    .update({ status: "published" })
    .eq("id", cycle_id);
  if (cycleErr) return problem(500, "Cycle update failed", cycleErr.message);

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "allocator.publish",
    target_table: "allocation_cycles",
    target_id: cycle_id,
    payload: { total, count: ledgerRows.length, allocation },
  });

  // Refresh balance MV (best-effort).
  try {
    await admin.rpc("refresh_points_balance");
  } catch {
    // best-effort — failure here just delays balance updates by ~10s.
  }

  // Invalidate caches for affected users + leaderboards.
  const walletKeys = ledgerRows.map((r) => cacheKeys.wallet(r.user_id));
  await cacheInvalidate(
    ...walletKeys,
    cacheKeys.leaderboard("company", "all"),
    cacheKeys.leaderboard("dept", "all"),
  );

  return ok({ status: "published", count: ledgerRows.length, total });
}
