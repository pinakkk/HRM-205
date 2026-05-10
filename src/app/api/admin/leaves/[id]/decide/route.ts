import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";
import { notify } from "@/lib/notifications";

const bodySchema = z.object({ decision: z.enum(["approved", "rejected"]) });

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return problem(403, "Admin only");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const { id } = await context.params;
  const leaveId = Number(id);
  if (!Number.isFinite(leaveId)) return problem(400, "Invalid id");

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("leaves")
    .select("id, user_id, start_date, end_date, status")
    .eq("id", leaveId)
    .single();
  if (!existing) return problem(404, "Not found");
  if (existing.status !== "pending") return problem(409, "Already decided");

  const { error } = await admin
    .from("leaves")
    .update({
      status: parsed.data.decision,
      approver_id: user.id,
      decided_at: new Date().toISOString(),
    })
    .eq("id", leaveId);
  if (error) return problem(500, "Update failed", error.message);

  await notify({
    user_id: existing.user_id,
    type: "system",
    title: `Leave ${parsed.data.decision}`,
    body: `${existing.start_date} → ${existing.end_date}`,
    link: "/employee/attendance",
  });

  return ok({ status: "ok" });
}
