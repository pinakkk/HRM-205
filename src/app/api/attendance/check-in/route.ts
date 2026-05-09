import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { rateLimits } from "@/lib/redis";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const rl = rateLimits.checkIn();
  if (rl) {
    const { success } = await rl.limit(user.id);
    if (!success) return problem(429, "Too many check-in attempts");
  }

  // Idempotency: skip if a check-in already exists today.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("user_id", user.id)
    .gte("check_in", today.toISOString())
    .maybeSingle();

  if (existing) return ok({ status: "already_checked_in" });

  const { data, error } = await supabase
    .from("attendance")
    .insert({ user_id: user.id, source: "web" })
    .select("id, check_in")
    .single();

  if (error) return problem(500, "Insert failed", error.message);
  return ok({ status: "checked_in", attendance: data });
}
