import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_INTENT_TTL_MS = 10 * 60_000;

/**
 * Supabase OAuth / magic-link callback. Exchanges the `code` for a session
 * and redirects to the role-appropriate landing page.
 *
 * Admin OAuth flow:
 *   The admin Google button mints a single-use intent token (see
 *   `/api/auth/admin-intent`) and forwards it as `intent_token`. We validate
 *   it with the service-role client, then promote the profile to 'admin'
 *   only if the row was just created by the auth trigger (within the token
 *   TTL window). The token is consumed atomically so it cannot be replayed.
 *
 *   An existing employee account never gets silently elevated — they're
 *   bounced to /employee with an error so admin and employee accounts
 *   stay properly separate.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect");
  const intent = searchParams.get("intent");
  const intentToken = searchParams.get("intent_token");

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

  const admin = createAdminClient();

  // Read the profile via service-role so we always see the row even if RLS
  // would have hidden it. The trigger may also fire slightly after the
  // session is established; retry once with a short delay if it's missing.
  let { data: profile } = await admin
    .from("users")
    .select("id, role, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    await new Promise((r) => setTimeout(r, 300));
    const retry = await admin
      .from("users")
      .select("id, role, created_at")
      .eq("id", user.id)
      .single();
    profile = retry.data;
  }

  if (!profile) {
    // The trigger never created a row — something is broken upstream.
    return NextResponse.redirect(`${origin}/login?error=profile_missing`);
  }

  if (intent === "admin") {
    if (!intentToken) {
      return NextResponse.redirect(
        `${origin}/login/admin?error=admin_intent_missing`,
      );
    }

    // Atomically claim the intent token: only succeeds if it exists, isn't
    // consumed, and is within the TTL window. Selecting the row back tells
    // us whether we won the race.
    const cutoff = new Date(Date.now() - ADMIN_INTENT_TTL_MS).toISOString();
    const { data: claimed } = await admin
      .from("admin_intent_tokens")
      .update({ consumed_at: new Date().toISOString(), consumed_by: user.id })
      .eq("token", intentToken)
      .is("consumed_at", null)
      .gte("created_at", cutoff)
      .select("token")
      .single();

    if (!claimed) {
      // Token expired, already used, or doesn't exist.
      return NextResponse.redirect(
        `${origin}/login/admin?error=admin_intent_invalid`,
      );
    }

    if (profile.role === "admin") {
      // Admin signing in with Google — nothing to elevate.
    } else {
      // Only elevate if this profile was created as part of THIS OAuth flow.
      // Compare `users.created_at` to the token TTL window: a fresh signup's
      // row will be seconds old; an existing employee's row will be hours
      // or days old.
      const profileAgeMs = Date.now() - Date.parse(profile.created_at);
      const isFreshSignup =
        Number.isFinite(profileAgeMs) && profileAgeMs < ADMIN_INTENT_TTL_MS;

      if (isFreshSignup) {
        const { data: updated } = await admin
          .from("users")
          .update({ role: "admin" })
          .eq("id", user.id)
          .eq("role", "employee")
          .select("id, role, created_at")
          .single();
        if (updated) profile = updated;
      } else {
        // Existing employee account — keep admin/employee separate. Sign
        // them out of the admin attempt and route back with an explanation.
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login/admin?error=existing_employee`,
        );
      }
    }
  }

  if (redirectTo) return NextResponse.redirect(`${origin}${redirectTo}`);
  return NextResponse.redirect(
    `${origin}${profile.role === "admin" ? "/admin" : "/employee"}`,
  );
}
