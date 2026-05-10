import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";
import { notify } from "@/lib/notifications";

const bodySchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  user_id: z.string().uuid(),
  reason: z.string().trim().max(280).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data: profile } = await supabase.from("users").select("role, full_name").eq("id", user.id).single();
  if (profile?.role !== "admin") return problem(403, "Admin only");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const admin = createAdminClient();
  const { error } = await admin
    .from("employee_of_month")
    .upsert(
      {
        year: parsed.data.year,
        month: parsed.data.month,
        user_id: parsed.data.user_id,
        reason: parsed.data.reason ?? null,
        selected_by: user.id,
        selected_at: new Date().toISOString(),
      },
      { onConflict: "year,month" },
    );

  if (error) return problem(500, "Save failed", error.message);

  await notify({
    user_id: parsed.data.user_id,
    type: "badge",
    title: `You're Employee of the Month — ${monthName(parsed.data.month)} ${parsed.data.year}`,
    body: parsed.data.reason ?? "Recognised by HR for outstanding contribution.",
    link: "/employee/leaderboard",
  });

  return ok({ status: "ok" });
}

function monthName(m: number) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
}
