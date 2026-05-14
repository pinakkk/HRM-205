import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const MIN_POOL = 1000;
const MIN_POOL_PER_EMPLOYEE = 100;

const bodySchema = z.object({
  label: z
    .string()
    .trim()
    .min(3, "Label must be at least 3 characters")
    .max(120)
    .regex(/[A-Za-z]/, "Label must contain at least one letter"),
  pool_amount: z
    .number()
    .int("Pool must be a whole rupee amount")
    .min(MIN_POOL, `Pool must be at least ₹${MIN_POOL.toLocaleString("en-IN")}`),
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
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return problem(400, "Invalid body", first?.message ?? parsed.error.message);
  }

  const { count: employeeCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "employee");

  const headcount = employeeCount ?? 0;
  if (headcount === 0) {
    return problem(400, "No employees", "Add at least one employee before creating a cycle.");
  }
  const minPoolForHeadcount = headcount * MIN_POOL_PER_EMPLOYEE;
  if (parsed.data.pool_amount < minPoolForHeadcount) {
    return problem(
      400,
      "Pool too small",
      `Pool must be at least ₹${minPoolForHeadcount.toLocaleString("en-IN")} (₹${MIN_POOL_PER_EMPLOYEE} × ${headcount} employees) to produce meaningful allocations.`,
    );
  }

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

const deleteSchema = z.object({
  cycle_id: z.string().uuid(),
});

export async function DELETE(request: Request) {
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

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const { data: cycle } = await supabase
    .from("allocation_cycles")
    .select("id, status")
    .eq("id", parsed.data.cycle_id)
    .maybeSingle();
  if (!cycle) return problem(404, "Cycle not found");
  if (cycle.status !== "draft") {
    return problem(409, "Cannot delete", "Only draft cycles can be deleted.");
  }

  const { error } = await supabase
    .from("allocation_cycles")
    .delete()
    .eq("id", parsed.data.cycle_id);
  if (error) return problem(500, "Delete failed", error.message);
  return ok({ deleted: parsed.data.cycle_id });
}
