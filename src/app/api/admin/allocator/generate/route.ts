import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";
import { rateLimits } from "@/lib/redis";
import { proposeAllocation } from "@/lib/llm/allocator";
import { allocatorInputSchema } from "@/lib/llm/schemas";
import { computeEmployeeFeatures } from "@/lib/llm/features";

const bodySchema = z.object({
  cycle_id: z.string().uuid(),
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

  const rl = rateLimits.allocator();
  if (rl) {
    const { success } = await rl.limit(user.id);
    if (!success) return problem(429, "Allocator rate limit");
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const { data: cycle } = await supabase
    .from("allocation_cycles")
    .select("id, label, pool_amount, status")
    .eq("id", parsed.data.cycle_id)
    .single();
  if (!cycle) return problem(404, "Cycle not found");
  if (cycle.status !== "draft") return problem(409, "Cycle not in draft");

  const { data: employees } = await supabase
    .from("users")
    .select("id, full_name, joined_at")
    .eq("role", "employee");

  if (!employees?.length) return problem(400, "No employees to allocate to");

  const admin = createAdminClient();
  const features = await computeEmployeeFeatures(admin, employees);

  const input = allocatorInputSchema.parse({
    cycle_label: cycle.label,
    pool_amount: Number(cycle.pool_amount),
    employees: features,
  });

  const allocation = await proposeAllocation(input);
  return ok({ cycle, allocation, features });
}
