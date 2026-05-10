import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Mints a single-use admin signup-intent token. The /signup/admin and
 * /login/admin Google buttons hit this route before redirecting to Google;
 * the returned token is forwarded to /auth/callback?intent=admin&token=...
 * where it is validated and consumed before promoting a freshly-created
 * profile to role='admin'.
 *
 * Tokens older than 10 minutes are treated as expired by the callback.
 */
export async function POST() {
  const admin = createAdminClient();

  // GC any old unconsumed tokens (cheap, opportunistic).
  await admin
    .from("admin_intent_tokens")
    .delete()
    .is("consumed_at", null)
    .lt("created_at", new Date(Date.now() - 10 * 60_000).toISOString());

  const { data, error } = await admin
    .from("admin_intent_tokens")
    .insert({})
    .select("token")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to mint admin intent token" },
      { status: 500 },
    );
  }

  return NextResponse.json({ token: data.token });
}
