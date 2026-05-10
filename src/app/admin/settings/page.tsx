import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { Coins, Bot, Database, Shield, ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: rules }, { count: users }, { count: kpis }, { count: items }] = await Promise.all([
    supabase
      .from("reward_rules")
      .select("id, name, trigger, points, active, notes")
      .order("active", { ascending: false })
      .order("name"),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("kpis").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("catalog_items").select("*", { count: "exact", head: true }).eq("active", true),
  ]);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-sm text-neutral-500">Reward configuration, AI guardrails, and system info.</p>
      </div>

      <Section icon={<Coins className="h-5 w-5" />} title="Reward rules" description="Configurable point-award rules. Edit values in the database; new rules show up here automatically.">
        {(rules ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">No rules defined.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-neutral-500">
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="py-2 text-left font-semibold">Name</th>
                  <th className="py-2 text-left font-semibold">Trigger</th>
                  <th className="py-2 text-right font-semibold">Points</th>
                  <th className="py-2 text-center font-semibold">Active</th>
                </tr>
              </thead>
              <tbody>
                {rules!.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                    <td className="py-2 font-semibold text-neutral-900 dark:text-white">{r.name}</td>
                    <td className="py-2 font-mono text-xs text-neutral-500">{r.trigger}</td>
                    <td className="py-2 text-right font-mono">{r.points}</td>
                    <td className="py-2 text-center">
                      {r.active ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">on</span>
                      ) : (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800">off</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section icon={<Bot className="h-5 w-5" />} title="AI guardrails" description="Models in use and the bonus allocator caps.">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <Info label="Sentiment / suggestions model" value={env.OPENROUTER_DEFAULT_MODEL} />
          <Info label="Bonus allocator model" value={env.OPENROUTER_ALLOCATOR_MODEL} />
          <Info label="Bias narrator model" value={env.OPENROUTER_NARRATOR_MODEL} />
          <Info label="Allocator single-employee cap" value="25% of pool" />
          <Info label="Allocator runs / hour / admin" value="3" />
          <Info label="OpenRouter key" value={env.OPENROUTER_API_KEY ? "configured" : "missing — fallbacks active"} />
        </dl>
      </Section>

      <Section icon={<Database className="h-5 w-5" />} title="System info" description="Current data volume.">
        <dl className="grid gap-3 text-sm md:grid-cols-3">
          <Info label="Employees" value={String(users ?? 0)} />
          <Info label="Active KPIs" value={String(kpis ?? 0)} />
          <Info label="Active catalog items" value={String(items ?? 0)} />
        </dl>
      </Section>

      <Section icon={<Shield className="h-5 w-5" />} title="Security" description="High-trust operations always require admin role.">
        <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600 dark:text-neutral-400">
          <li>RLS enforced at the database — service role used only server-side.</li>
          <li>Sign-out invalidates the session cookie immediately.</li>
          <li>Admin actions write to <code className="font-mono">audit_log</code> for replay.</li>
        </ul>
      </Section>

      <Section icon={<ScrollText className="h-5 w-5" />} title="Compliance" description="DPDP Act 2023 (India).">
        <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600 dark:text-neutral-400">
          <li>Gender is opt-in only and used solely in aggregated bias audits.</li>
          <li>Right to erasure supported via user delete (cascades through ledger anonymisation).</li>
          <li>Consent versioning recorded on the user row.</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{icon}</div>
        <div>
          <h2 className="font-bold text-neutral-900 dark:text-white">{title}</h2>
          <p className="text-xs text-neutral-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-100 px-3 py-2 dark:border-neutral-800">
      <dt className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</dt>
      <dd className="mt-0.5 font-mono text-xs text-neutral-900 dark:text-white">{value}</dd>
    </div>
  );
}
