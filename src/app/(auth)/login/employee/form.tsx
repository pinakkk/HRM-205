"use client";

import { useSearchParams } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function EmployeeAuthPanel() {
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const errorParam = params.get("error");

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      {errorParam === "oauth_failed" && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Google sign-in failed. Please try again.
        </div>
      )}
      <GoogleButton redirect={redirect} role="employee" variant="light" />
      <p className="text-center text-xs text-neutral-500">
        We use Google sign-in to keep accounts secure and tied to your
        company identity. We never see your password.
      </p>
    </div>
  );
}
