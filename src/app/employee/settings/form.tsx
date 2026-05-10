"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toasts } from "@/components/ui/Toaster";

type Gender = "female" | "male" | "non-binary" | "prefer-not-to-say";

export function SettingsForm({
  initialGender,
  consentedAt,
  prefs,
}: {
  initialGender: string | null;
  consentedAt: string | null;
  prefs: { in_app: boolean; email_digest: boolean };
}) {
  const router = useRouter();
  const [inApp, setInApp] = useState(prefs.in_app);
  const [emailDigest, setEmailDigest] = useState(prefs.email_digest);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [consent, setConsent] = useState<boolean>(Boolean(initialGender));
  const [gender, setGender] = useState<Gender>((initialGender as Gender) ?? "prefer-not-to-say");
  const [savingConsent, setSavingConsent] = useState(false);

  async function savePrefs() {
    setSavingPrefs(true);
    try {
      const res = await fetch("/api/me/profile/prefs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ in_app: inApp, email_digest: emailDigest }),
      });
      if (!res.ok) throw new Error("Save failed");
      toasts.success("Notification preferences saved.");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingPrefs(false);
    }
  }

  async function saveConsent(e: React.FormEvent) {
    e.preventDefault();
    setSavingConsent(true);
    try {
      const res = await fetch("/api/me/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gender: consent ? gender : null, consent }),
      });
      if (!res.ok) throw new Error("Save failed");
      toasts.success(consent ? "Consent saved." : "Consent withdrawn.");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingConsent(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Notification preferences" description="Control how you receive updates.">
        <div className="space-y-3">
          <Toggle
            label="In-app notifications"
            description="Show updates in the bell icon and notifications page."
            checked={inApp}
            onChange={setInApp}
          />
          <Toggle
            label="Weekly email digest"
            description="Sunday summary of your rewards and activity."
            checked={emailDigest}
            onChange={setEmailDigest}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={savePrefs}
            disabled={savingPrefs}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {savingPrefs ? "Saving…" : "Save preferences"}
          </button>
        </div>
      </Card>

      <Card
        title="Privacy & data consent"
        description="The fairness audit can use gender to detect statistical bias — only with your explicit opt-in. You can withdraw any time."
      >
        <form onSubmit={saveConsent} className="space-y-4">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I consent to FairReward AI including my gender in aggregated fairness audits. Data is
              encrypted at rest and never appears in individual reward decisions.
            </span>
          </label>
          {consent && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
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
              disabled={savingConsent}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingConsent ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="mb-4">
        <h2 className="font-bold text-neutral-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-neutral-100 p-3 dark:border-neutral-800">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-neutral-900 dark:text-white">{label}</div>
        <div className="text-xs text-neutral-500">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5"
      />
    </label>
  );
}
