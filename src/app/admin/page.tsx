import { createClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = await createClient();

  const [{ count: userCount }, { count: pendingRedemptions }, { count: openCycles }] =
    await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase
        .from("redemptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("allocation_cycles")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">HR Operations</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Active employees" value={userCount ?? 0} />
        <Card label="Pending redemptions" value={pendingRedemptions ?? 0} />
        <Card label="Draft allocation cycles" value={openCycles ?? 0} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
    </div>
  );
}
