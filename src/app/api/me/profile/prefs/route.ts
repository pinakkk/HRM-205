import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const bodySchema = z.object({
  in_app: z.boolean(),
  email_digest: z.boolean(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const { error } = await supabase
    .from("users")
    .update({ notification_prefs: parsed.data })
    .eq("id", user.id);

  if (error) return problem(500, "Update failed", error.message);
  return ok({ status: "ok" });
}
