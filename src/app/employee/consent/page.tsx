import { requireUser } from "@/lib/auth";
import { ConsentForm } from "./form";

export default async function ConsentPage() {
  const me = await requireUser();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Privacy & data consent</h1>
        <p className="mt-1 text-sm text-neutral-500">
          FairReward AI runs a fairness audit across reward distribution. This audit can use your
          gender to detect statistical bias, but only if you opt in. You can change or withdraw at
          any time.
        </p>
      </div>

      <section className="space-y-2 rounded-md border p-4 text-sm">
        <h2 className="font-medium">What we collect by default</h2>
        <ul className="list-disc space-y-1 pl-5 text-neutral-600 dark:text-neutral-400">
          <li>Your name, email, role, department, joining date.</li>
          <li>Attendance check-ins, KPI progress, peer feedback you send and receive.</li>
          <li>Reward ledger entries (points, bonuses, kudos, badges).</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-md border p-4 text-sm">
        <h2 className="font-medium">Opt-in: gender for fairness audit</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          If you consent, gender is included in aggregated bias audits — never displayed in
          individual records, never used by the bonus allocator. Storage is encrypted at rest.
        </p>
      </section>

      <ConsentForm currentGender={me.profile.gender} consentedAt={me.profile.consent_at} />
    </div>
  );
}
