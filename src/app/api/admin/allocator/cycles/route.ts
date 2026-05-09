import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const bodySchema = z.object({
  label: z.string().min(2).max(120),
  pool_amount: z.number().positive(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return problem(403, "Admin only");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const { data, error } = await supabase
    .from("allocation_cycles")
    .insert({
      label: parsed.data.label,
      pool_amount: parsed.data.pool_amount,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error) return problem(500, "Insert failed", error.message);
  return ok(data);
}
