import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const bodySchema = z.object({ id: z.number().optional() });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const now = new Date().toISOString();
  const q = supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("user_id", user.id)
    .is("read_at", null);

  const { error } = parsed.data.id ? await q.eq("id", parsed.data.id) : await q;
  if (error) return problem(500, "Update failed", error.message);
  return ok({ status: "ok" });
}
