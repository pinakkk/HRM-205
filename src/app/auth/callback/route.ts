import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase OAuth / magic-link callback. Exchanges the `code` for a session
 * and redirects to the role-appropriate landing page.
 *
 * `intent=admin` is set by the GoogleButton on the admin signup page. The
 * `handle_new_user` trigger defaults OAuth users to 'employee' (Google does
 * not pass a role in raw_user_meta_data). When `intent=admin` AND the user's
 * profile row was just created (within 60s), we promote them. Existing
 * users keep their stored role regardless of intent.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect");
  const intent = searchParams.get("intent");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  let { data: profile } = await supabase
    .from("users")
    .select("role, created_at")
    .eq("id", user.id)
    .single();

  // Promote to admin only on first OAuth signup via the admin portal.
  // Existing employees clicking "Continue with Google" on the admin signup
  // page will not be elevated.
  if (intent === "admin" && profile?.role === "employee" && profile.created_at) {
    const isFreshProfile =
      Date.now() - Date.parse(profile.created_at) < 60 * 1000;
    if (isFreshProfile) {
      const { data: updated } = await supabase
        .from("users")
        .update({ role: "admin" })
        .eq("id", user.id)
        .eq("role", "employee")
        .select("role, created_at")
        .single();
      if (updated) profile = updated;
    }
  }

  if (redirectTo) return NextResponse.redirect(`${origin}${redirectTo}`);
  return NextResponse.redirect(
    `${origin}${profile?.role === "admin" ? "/admin" : "/employee"}`,
  );
}
