import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const bodySchema = z.object({ item_id: z.string().uuid() });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const { data: item } = await supabase
    .from("catalog_items")
    .select("id, cost_points, active, stock")
    .eq("id", parsed.data.item_id)
    .maybeSingle();
  if (!item || !item.active) return problem(404, "Item unavailable");
  if (item.stock !== null && item.stock !== -1 && item.stock <= 0) {
    return problem(409, "Out of stock");
  }

  const { data: balance } = await supabase
    .from("points_balance")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!balance || balance.balance < item.cost_points) {
    return problem(402, "Insufficient points");
  }

  const { data, error } = await supabase
    .from("redemptions")
    .insert({
      user_id: user.id,
      item_id: item.id,
      points_spent: item.cost_points,
    })
    .select("id, status")
    .single();
  if (error) return problem(500, "Insert failed", error.message);
  return ok(data);
}
