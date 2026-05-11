"use client";

import { GoogleButton } from "@/components/auth/GoogleButton";

export function AdminSignupForm() {
  return (
    <div className="space-y-3">
      <GoogleButton role="admin" variant="light" label="Sign up with Google" />

      <p className="text-center text-xs leading-relaxed text-violet-500">
        Admin accounts are created with Google only. Your account stays tied to your company
        identity and we never see your password.
      </p>
    </div>
  );
}
