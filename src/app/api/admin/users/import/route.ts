import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";

const userSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1),
  role: z.enum(["employee", "admin"]).default("employee"),
  department: z.string().optional(),
  gender: z.string().optional(),
});

const bodySchema = z.object({ users: z.array(userSchema).min(1).max(500) });

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

  const admin = createAdminClient();
  const results: { email: string; status: "created" | "skipped" | "error"; detail?: string }[] = [];

  for (const u of parsed.data.users) {
    const { data: existing } = await admin
      .from("users")
      .select("id")
      .eq("email", u.email)
      .maybeSingle();

    if (existing) {
      results.push({ email: u.email, status: "skipped" });
      continue;
    }

    // Create auth user (random password — admin must trigger reset).
    const tempPassword = crypto.randomUUID() + "Aa1!";
    const { data: created, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });
    if (error || !created.user) {
      results.push({ email: u.email, status: "error", detail: error?.message });
      continue;
    }

    await admin
      .from("users")
      .update({
        full_name: u.full_name,
        role: u.role,
        department: u.department ?? null,
        gender: u.gender ?? null,
      })
      .eq("id", created.user.id);

    results.push({ email: u.email, status: "created" });
  }

  return ok({ results });
}
