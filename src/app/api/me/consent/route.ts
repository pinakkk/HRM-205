import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const CONSENT_VERSION = "2026-05";

const bodySchema = z.object({
  gender: z.enum(["female", "male", "non-binary", "prefer-not-to-say"]).nullable(),
  consent: z.boolean(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const { gender, consent } = parsed.data;
  const { error } = await supabase
    .from("users")
    .update({
      gender: consent ? gender : null,
      consent_at: new Date().toISOString(),
      consent_version: CONSENT_VERSION,
    })
    .eq("id", user.id);

  if (error) return problem(500, "Update failed", error.message);
  return ok({ status: "ok" });
}
