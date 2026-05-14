import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const bodySchema = z.object({
  assignment_id: z.number().int().positive(),
  achieved: z.number().nonnegative(),
  note: z.string().max(2000).optional(),
  evidence_url: z.string().url().max(1000).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data, error } = await supabase
    .from("kpi_submissions")
    .select(
      "id, assignment_id, achieved, note, evidence_url, status, decision_note, decided_at, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return problem(500, "Failed to load submissions", error.message);
  return ok({ submissions: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const { data: assignment } = await supabase
    .from("kpi_assignments")
    .select("id, user_id")
    .eq("id", parsed.data.assignment_id)
    .maybeSingle();
  if (!assignment || assignment.user_id !== user.id) {
    return problem(404, "Assignment not found");
  }

  const { data: existing } = await supabase
    .from("kpi_submissions")
    .select("id")
    .eq("assignment_id", parsed.data.assignment_id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) {
    return problem(409, "A submission is already pending for this KPI");
  }

  const { data, error } = await supabase
    .from("kpi_submissions")
    .insert({
      assignment_id: parsed.data.assignment_id,
      user_id: user.id,
      achieved: parsed.data.achieved,
      note: parsed.data.note ?? null,
      evidence_url: parsed.data.evidence_url ?? null,
    })
    .select("id, status, created_at")
    .single();
  if (error) return problem(500, "Submission failed", error.message);

  return ok({ submission: data }, { status: 201 });
}
