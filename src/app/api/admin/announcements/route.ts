import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";
import { notifyMany } from "@/lib/notifications";

const AUDIENCES = ["all", "engineering", "sales", "marketing", "hr", "finance"] as const;

const bodySchema = z.object({
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(2).max(2000),
  audience: z.enum(AUDIENCES),
  pinned: z.boolean().default(false),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return problem(403, "Forbidden");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "Invalid body", parsed.error.message);

  const admin = createAdminClient();
  const { data: created, error } = await admin
    .from("announcements")
    .insert({ ...parsed.data, author_id: user.id })
    .select("id")
    .single();
  if (error || !created) return problem(500, "Insert failed", error?.message);

  // Fan-out to notifications.
  const targetQuery = admin.from("users").select("id, notification_prefs, department");
  const { data: users } = parsed.data.audience === "all"
    ? await targetQuery
    : await targetQuery.eq("department", capitalize(parsed.data.audience));

  const recipients = (users ?? []).filter((u) => {
    const prefs = (u.notification_prefs as { in_app?: boolean } | null) ?? {};
    return prefs.in_app !== false;
  });

  await notifyMany(
    recipients.map((u) => ({
      user_id: u.id,
      type: "announcement" as const,
      title: parsed.data.title,
      body: parsed.data.body.slice(0, 280),
      link: "/employee/notifications",
    })),
  );

  return ok({ id: created.id, recipients: recipients.length });
}

function capitalize(s: string) {
  if (s === "hr") return "HR";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
