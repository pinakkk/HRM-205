import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";

const bodySchema = z.object({
  decision: z.enum(["approve", "reject"]),
  note: z.string().max(2000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const submissionId = Number(id);
  if (!Number.isInteger(submissionId)) return problem(400, "Invalid submission id");

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

  const admin = createAdminClient();

  const { data: submission } = await admin
    .from("kpi_submissions")
    .select("id, assignment_id, user_id, achieved, status")
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission) return problem(404, "Submission not found");
  if (submission.status !== "pending") return problem(409, "Submission already decided");

  const newStatus = parsed.data.decision === "approve" ? "approved" : "rejected";

  const { error: updateErr } = await admin
    .from("kpi_submissions")
    .update({
      status: newStatus,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
      decision_note: parsed.data.note ?? null,
    })
    .eq("id", submissionId);
  if (updateErr) return problem(500, "Update failed", updateErr.message);

  if (parsed.data.decision === "approve") {
    const { error: assignErr } = await admin
      .from("kpi_assignments")
      .update({ achieved: submission.achieved })
      .eq("id", submission.assignment_id);
    if (assignErr) return problem(500, "Failed to apply achievement", assignErr.message);
  }

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: `kpi_submission.${parsed.data.decision}`,
    target_table: "kpi_submissions",
    target_id: String(submissionId),
    payload: {
      user_id: submission.user_id,
      assignment_id: submission.assignment_id,
      achieved: submission.achieved,
    },
  });

  return ok({ status: newStatus });
}
