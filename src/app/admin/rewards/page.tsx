import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ManualAwardForm } from "./manual-award";
import { Gift, ShoppingBag, Inbox, Settings, Coins } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RewardManagementPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ count: catalogCount }, { count: pendingRedemptions }, { count: rulesCount }, recent] =
    await Promise.all([
      supabase.from("catalog_items").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("redemptions").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("reward_rules").select("*", { count: "exact", head: true }).eq("active", true),
      supabase
        .from("rewards_ledger")
        .select("id, kind, amount, reason, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const userIds = Array.from(new Set((recent.data ?? []).map((r) => r.user_id)));
  const { data: users } = userIds.length
    ? await supabase.from("users").select("id, full_name").in("id", userIds)
    : { data: [] as { id: string; full_name: string }[] };
  const userMap = new Map((users ?? []).map((u) => [u.id, u.full_name]));

  const { data: employees } = await supabase
    .from("users")
    .select("id, full_name, department")
    .eq("role", "employee")
    .order("full_name");

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Reward Management</h1>
        <p className="text-sm text-neutral-500">Manual awards, redemption queue, catalog and reward rules.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <HubLink
          href="/admin/catalog"
          icon={<ShoppingBag className="h-5 w-5" />}
          title="Catalog"
          subtitle={`${catalogCount ?? 0} active items`}
        />
        <HubLink
          href="/admin/redemptions"
          icon={<Inbox className="h-5 w-5" />}
          title="Redemption queue"
          subtitle={`${pendingRedemptions ?? 0} pending`}
          accent={pendingRedemptions ? "amber" : undefined}
        />
        <HubLink
          href="/admin/settings"
          icon={<Settings className="h-5 w-5" />}
          title="Reward rules"
          subtitle={`${rulesCount ?? 0} active rules`}
        />
        <HubLink
          href="/admin/allocator"
          icon={<Coins className="h-5 w-5" />}
          title="Bonus allocator"
          subtitle="AI-assisted bonus cycles"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ManualAwardForm employees={employees ?? []} />
        </div>
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white">Recent ledger</h3>
            <Link href="/admin/reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          {(recent.data ?? []).length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <Gift className="h-8 w-8 text-neutral-400" />
              <p className="text-sm text-neutral-500">No reward activity yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {(recent.data ?? []).map((r) => (
                <li key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {userMap.get(r.user_id) ?? "Unknown"} <span className="text-neutral-400">·</span>{" "}
                      <span className="text-neutral-500 capitalize">{r.reason}</span>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {r.kind} · {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${Number(r.amount) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {Number(r.amount) >= 0 ? "+" : ""}
                    {r.amount}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function HubLink({
  href,
  icon,
  title,
  subtitle,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent?: "amber";
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-indigo-900"
    >
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${accent === "amber" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300"}`}>
        {icon}
      </div>
      <div className="text-sm font-bold text-neutral-900 dark:text-white">{title}</div>
      <div className="text-xs text-neutral-500">{subtitle}</div>
    </Link>
  );
}
