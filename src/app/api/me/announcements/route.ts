import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, audience, pinned, published_at")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(10);

  return ok({ items: data ?? [] });
}
