import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Supabase OAuth / magic-link callback. Exchanges the `code` for a session
 * and redirects to the role-appropriate landing page.
 *
 * Admin OAuth signup flow:
 *   GoogleButton on /signup/admin and /login/admin appends `intent=admin` to
 *   the callback URL. The `handle_new_user` trigger always inserts OAuth
 *   users with role='employee' (Google never sends a role in user metadata).
 *   When intent=admin AND this is the user's very first sign-in, we use
 *   the service-role client to promote the row to 'admin' — RLS blocks the
 *   user's own client from changing their role.
 *
 *   Only the first sign-in is eligible for elevation, so an existing
 *   employee who later clicks "Continue with Google" on the admin page is
 *   not silently promoted; they are bounced to /employee.
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

  // Use the service-role client to read + (optionally) elevate the role.
  // The user's own session can read their row but cannot change `role`
  // (blocked by users_self_update RLS policy).
  const admin = createAdminClient();

  let { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Some triggers fire asynchronously; if the profile row is not visible
  // yet, give the trigger a brief moment then re-read once.
  if (!profile) {
    await new Promise((r) => setTimeout(r, 250));
    const retry = await admin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    profile = retry.data;
  }

  if (intent === "admin" && profile?.role === "employee") {
    // Supabase sets `last_sign_in_at` to equal `created_at` on the very
    // first sign-in. Any later sign-in advances `last_sign_in_at`. We use
    // that to detect a brand-new account and gate the role elevation.
    const createdAt = user.created_at ? Date.parse(user.created_at) : NaN;
    const lastSignInAt = user.last_sign_in_at
      ? Date.parse(user.last_sign_in_at)
      : NaN;
    const isFirstSignIn =
      Number.isFinite(createdAt) &&
      Number.isFinite(lastSignInAt) &&
      Math.abs(lastSignInAt - createdAt) < 5_000;

    if (isFirstSignIn) {
      const { data: updated } = await admin
        .from("users")
        .update({ role: "admin" })
        .eq("id", user.id)
        .eq("role", "employee")
        .select("role")
        .single();
      if (updated) profile = updated;
    }
  }

  if (redirectTo) return NextResponse.redirect(`${origin}${redirectTo}`);
  return NextResponse.redirect(
    `${origin}${profile?.role === "admin" ? "/admin" : "/employee"}`,
  );
}
