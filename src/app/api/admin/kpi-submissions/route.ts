import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status") ?? "pending";
  const allowed = ["pending", "approved", "rejected"] as const;
  const status = (allowed as readonly string[]).includes(statusParam)
    ? (statusParam as (typeof allowed)[number])
    : "pending";

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("kpi_submissions")
    .select(
      "id, assignment_id, user_id, achieved, note, evidence_url, status, decision_note, decided_at, created_at, kpi_assignments(cycle, target, achieved, kpis(title, weight)), users!kpi_submissions_user_id_fkey(full_name, email)",
    )
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) return problem(500, "Failed to load submissions", error.message);

  return ok({ submissions: data ?? [] });
}
