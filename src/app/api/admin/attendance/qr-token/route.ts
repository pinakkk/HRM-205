import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { currentQrToken } from "@/lib/qr-token";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return problem(403, "Admin only");

  return ok(currentQrToken());
}
