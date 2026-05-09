import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";

export default async function StorePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalog_items")
    .select("id, name, description, cost_points, stock")
    .eq("active", true)
    .order("cost_points", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Redemption store</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((item) => (
          <div key={item.id} className="rounded-md border p-4">
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-neutral-500">{item.description}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-sm">
                {formatPoints(item.cost_points)} pts
              </span>
              <button className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700">
                Redeem
              </button>
            </div>
          </div>
        )) ?? null}
      </div>
    </div>
  );
}
