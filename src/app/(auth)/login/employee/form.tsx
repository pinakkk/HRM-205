"use client";

import { useSearchParams } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function EmployeeAuthPanel() {
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const errorParam = params.get("error");

  return (
    <div className="mt-8 space-y-4">
      {errorParam === "oauth_failed" && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          Google sign-in failed. Please try again.
        </div>
      )}
      <GoogleButton redirect={redirect} role="employee" variant="light" />
    </div>
  );
}
