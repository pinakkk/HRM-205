import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase OAuth / magic-link callback. Exchanges the `code` for a session
 * and redirects to the role-appropriate landing page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (redirectTo) return NextResponse.redirect(`${origin}${redirectTo}`);
      return NextResponse.redirect(
        `${origin}${profile?.role === "admin" ? "/admin" : "/employee"}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
