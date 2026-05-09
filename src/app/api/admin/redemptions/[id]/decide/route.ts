import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";
import { cacheInvalidate, cacheKeys } from "@/lib/redis";

const bodySchema = z.object({
  decision: z.enum(["approve", "reject"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const redemptionId = Number(id);
  if (!Number.isInteger(redemptionId)) return problem(400, "Invalid redemption id");

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

  const admin = createAdminClient();

  const { data: redemption } = await admin
    .from("redemptions")
    .select("id, user_id, item_id, points_spent, status, catalog_items(name)")
    .eq("id", redemptionId)
    .maybeSingle();
  if (!redemption) return problem(404, "Redemption not found");
  if (redemption.status !== "pending") return problem(409, "Redemption already decided");

  const newStatus = parsed.data.decision === "approve" ? "approved" : "rejected";

  const { error: updateErr } = await admin
    .from("redemptions")
    .update({ status: newStatus, decided_by: user.id })
    .eq("id", redemptionId);
  if (updateErr) return problem(500, "Update failed", updateErr.message);

  if (parsed.data.decision === "approve") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemName = (redemption.catalog_items as any)?.name ?? "catalog item";
    const { error: ledgerErr } = await admin.from("rewards_ledger").insert({
      user_id: redemption.user_id,
      kind: "points",
      amount: -redemption.points_spent,
      reason: `Redemption approved: ${itemName}`,
      source: "manual",
      awarded_by: user.id,
      rationale_json: { redemption_id: redemptionId },
    });
    if (ledgerErr) return problem(500, "Ledger insert failed", ledgerErr.message);

    // Decrement stock if tracked.
    const { data: item } = await admin
      .from("catalog_items")
      .select("stock")
      .eq("id", redemption.item_id)
      .maybeSingle();
    if (item && item.stock !== null && item.stock > 0) {
      await admin
        .from("catalog_items")
        .update({ stock: item.stock - 1 })
        .eq("id", redemption.item_id);
    }

    try {
      await admin.rpc("refresh_points_balance");
    } catch {
      // best-effort
    }

    await cacheInvalidate(
      cacheKeys.wallet(redemption.user_id),
      cacheKeys.leaderboard("company", "all"),
      cacheKeys.leaderboard("dept", "all"),
    );
  }

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: `redemption.${parsed.data.decision}`,
    target_table: "redemptions",
    target_id: String(redemptionId),
    payload: { user_id: redemption.user_id, points: redemption.points_spent },
  });

  return ok({ status: newStatus });
}
