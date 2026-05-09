"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toasts } from "@/components/ui/Toaster";

type Gender = "female" | "male" | "non-binary" | "prefer-not-to-say";

export function ConsentForm({
  currentGender,
  consentedAt,
}: {
  currentGender: string | null;
  consentedAt: string | null;
}) {
  const router = useRouter();
  const [consent, setConsent] = useState<boolean>(Boolean(currentGender));
  const [gender, setGender] = useState<Gender>(
    (currentGender as Gender) ?? "prefer-not-to-say",
  );
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/me/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gender: consent ? gender : null, consent }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? "Save failed");
      }
      toasts.success(consent ? "Consent saved." : "Gender removed; consent withdrawn.");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-md border p-4">
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          I consent to FairReward AI including my gender in aggregated fairness audits. I
          understand the data is encrypted and never exposed in individual reward decisions.
        </span>
      </label>

      {consent && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full rounded border px-2 py-1 text-sm"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          {consentedAt
            ? `Last updated ${new Date(consentedAt).toLocaleDateString()}`
            : "Not yet recorded"}
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
