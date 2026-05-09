import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: balance } = await supabase
    .from("points_balance")
    .select("balance, bonus_total, lifetime_total")
    .eq("user_id", user.id)
    .maybeSingle();

  return ok({ profile, balance });
}
