"use client";

import { GoogleButton } from "@/components/auth/GoogleButton";

export function AdminSignupForm() {
  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
      <GoogleButton role="admin" variant="dark" label="Sign up with Google" />

      <p className="text-center text-xs text-neutral-500">
        Admin accounts are created with Google only. Your account stays tied
        to your company identity and we never see your password.
      </p>
    </div>
  );
}
