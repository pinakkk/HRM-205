import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { verifyQrToken } from "@/lib/qr-token";
import { rateLimits } from "@/lib/redis";

const bodySchema = z.object({ token: z.string().min(8).max(64) });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const rl = rateLimits.checkIn();
  if (rl) {
    const { success } = await rl.limit(`qr:${user.id}`);
    if (!success) return problem(429, "Too many attempts");
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  if (!verifyQrToken(parsed.data.token)) return problem(400, "Invalid or expired QR token");

  // Idempotent per day: skip if a check-in already exists today.
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("user_id", user.id)
    .gte("check_in", startOfDay.toISOString())
    .limit(1);
  if (existing && existing.length > 0) {
    return ok({ status: "already-checked-in" });
  }

  const { error } = await supabase.from("attendance").insert({
    user_id: user.id,
    source: "qr",
  });
  if (error) return problem(500, "Insert failed", error.message);
  return ok({ status: "ok" });
}
