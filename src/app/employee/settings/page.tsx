import { requireUser } from "@/lib/auth";
import { SettingsForm } from "./form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await requireUser();
  const prefs =
    typeof me.profile.notification_prefs === "object" && me.profile.notification_prefs
      ? (me.profile.notification_prefs as { in_app?: boolean; email_digest?: boolean })
      : {};

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-sm text-neutral-500">Notification preferences, privacy & data consent.</p>
      </div>

      <SettingsForm
        initialGender={me.profile.gender}
        consentedAt={me.profile.consent_at}
        prefs={{
          in_app: prefs.in_app ?? true,
          email_digest: prefs.email_digest ?? true,
        }}
      />
    </div>
  );
}
