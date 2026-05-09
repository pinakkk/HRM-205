"use client";

import { useSearchParams } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function AdminLoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const justSignedUp = params.get("confirm") === "1";
  const errorParam = params.get("error");

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
      {justSignedUp && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          Account created. Continue with Google to sign in.
        </div>
      )}
      {errorParam === "oauth_failed" && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          Google sign-in failed. Please try again.
        </div>
      )}
      {errorParam === "existing_employee" && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          This Google account is already registered as an employee. Use the
          employee portal, or sign in with a different Google account to
          create a new admin.
        </div>
      )}
      {(errorParam === "admin_intent_invalid" ||
        errorParam === "admin_intent_missing") && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          Admin sign-in link expired or was already used. Please try again.
        </div>
      )}

      <GoogleButton redirect={redirect} role="admin" variant="dark" />

      <p className="text-center text-xs text-neutral-500">
        Admin sign-in uses Google only. Your account stays tied to your
        company identity and we never see your password.
      </p>
    </div>
  );
}
