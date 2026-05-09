import { z } from "zod";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";
import { rateLimits } from "@/lib/redis";
import { classifySentiment } from "@/lib/llm/sentiment";

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

  // Fire-and-forget sentiment classification. Edge function is the canonical
  // path in prod; this in-process call ensures the demo works without
  // deploying a Supabase function.
  after(async () => {
    try {
      const sentiment = await classifySentiment(parsed.data.body);
      if (!sentiment) return;
      const admin = createAdminClient();
      await admin
        .from("feedback")
        .update({
          sentiment: sentiment.sentiment,
          sentiment_score: sentiment.score,
        })
        .eq("id", data.id);
    } catch {
      // best-effort
    }
  });

  return ok({ id: data.id });
}
