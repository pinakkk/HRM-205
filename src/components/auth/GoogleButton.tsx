"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type GoogleButtonProps = {
  redirect?: string | null;
  role?: "employee" | "admin";
  variant?: "light" | "dark";
  label?: string;
};

export function GoogleButton({
  redirect,
  role = "employee",
  variant = "light",
  label,
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (redirect) callbackUrl.searchParams.set("redirect", redirect);

    if (role === "admin") {
      // Mint a server-side single-use admin intent token. The callback
      // verifies + consumes it before promoting the freshly-created profile
      // to role='admin'. We can't trust client metadata here because Google
      // strips custom user_metadata.role on first OAuth sign-in.
      try {
        const res = await fetch("/api/auth/admin-intent", { method: "POST" });
        if (!res.ok) throw new Error("Could not start admin sign-in.");
        const { token } = (await res.json()) as { token?: string };
        if (!token) throw new Error("Could not start admin sign-in.");
        callbackUrl.searchParams.set("intent", "admin");
        callbackUrl.searchParams.set("intent_token", token);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Admin sign-in setup failed");
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  const isDark = variant === "dark";
  const buttonClass = isDark
    ? "flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-100 transition-colors hover:border-neutral-600 hover:bg-neutral-800 disabled:opacity-60"
    : "flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 disabled:opacity-60";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={buttonClass}
      >
        <GoogleIcon />
        {loading ? "Redirecting…" : (label ?? "Continue with Google")}
      </button>
      {error && (
        <p className={isDark ? "text-sm text-rose-400" : "text-sm text-rose-600"}>
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
