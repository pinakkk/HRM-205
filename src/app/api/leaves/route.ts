import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const bodySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["casual", "sick", "earned", "unpaid"]),
  reason: z.string().trim().max(280).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);
  if (parsed.data.start_date > parsed.data.end_date)
    return problem(400, "Invalid range", "start_date must be on or before end_date");

  const { error } = await supabase.from("leaves").insert({
    user_id: user.id,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    type: parsed.data.type,
    reason: parsed.data.reason ?? null,
  });
  if (error) return problem(500, "Insert failed", error.message);
  return ok({ status: "ok" });
}
