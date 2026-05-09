import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["users"]["Row"];

/**
 * Loads the current authenticated user + profile row, or null if signed out.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile ? { auth: user, profile } : null;
}

/**
 * Server-side guard: redirects to /login if not authenticated.
 */
export async function requireUser() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  return me;
}

/**
 * Server-side guard: redirects non-admins to /employee.
 */
export async function requireAdmin() {
  const me = await requireUser();
  if (me.profile.role !== "admin") redirect("/employee");
  return me;
}
