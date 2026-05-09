import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";

export default async function EmployeeDashboard() {
  const me = await requireUser();
  const supabase = await createClient();

  const { data: balance } = await supabase
    .from("points_balance")
    .select("balance, bonus_total, lifetime_total")
    .eq("user_id", me.profile.id)
    .maybeSingle();

  const { data: recent } = await supabase
    .from("rewards_ledger")
    .select("id, kind, amount, reason, created_at")
    .eq("user_id", me.profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hi, {me.profile.full_name.split(" ")[0]} 👋</h1>
        <p className="text-sm text-neutral-500">Here&apos;s your reward snapshot.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Points balance" value={formatPoints(balance?.balance ?? 0)} />
        <Card label="Bonus this year" value={`₹${formatPoints(balance?.bonus_total ?? 0)}`} />
        <Card label="Lifetime points" value={formatPoints(balance?.lifetime_total ?? 0)} />
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Recent activity</h2>
        <div className="rounded-md border">
          {recent?.length ? (
            <ul className="divide-y">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <div className="font-medium capitalize">{r.kind}</div>
                    <div className="text-neutral-500">{r.reason}</div>
                  </div>
                  <div className="font-mono">{formatPoints(Number(r.amount))}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-neutral-500">No rewards yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
