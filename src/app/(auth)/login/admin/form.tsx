"use client";

import { useSearchParams } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function AdminLoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const justSignedUp = params.get("confirm") === "1";
  const errorParam = params.get("error");

  return (
    <div className="mt-8 space-y-4">
      {justSignedUp && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Account created. Continue with Google to sign in.
        </div>
      )}
      {errorParam === "oauth_failed" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          Google sign-in failed. Please try again.
        </div>
      )}
      {errorParam === "existing_employee" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          This Google account is already registered as an employee. Use the employee portal, or sign
          in with a different Google account to create a new admin.
        </div>
      )}
      {(errorParam === "admin_intent_invalid" || errorParam === "admin_intent_missing") && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          Admin sign-in link expired or was already used. Please try again.
        </div>
      )}

      <GoogleButton redirect={redirect} role="admin" variant="light" />
    </div>
  );
}
