import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { rateLimits } from "@/lib/redis";

const bodySchema = z.object({
  to_user_id: z.string().uuid(),
  body: z.string().min(3).max(2000),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const rl = rateLimits.feedback();
  if (rl) {
    const { success } = await rl.limit(user.id);
    if (!success) return problem(429, "Daily feedback limit reached");
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  if (parsed.data.to_user_id === user.id) {
    return problem(400, "Cannot send feedback to yourself");
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      from_user_id: user.id,
      to_user_id: parsed.data.to_user_id,
      body: parsed.data.body,
    })
    .select("id")
    .single();

  if (error) return problem(500, "Insert failed", error.message);
  // L1 sentiment classification is fired from a Supabase edge function trigger.
  return ok({ id: data.id });
}
