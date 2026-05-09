import { createClient } from "@/lib/supabase/server";

export default async function AdminCatalogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalog_items")
    .select("id, name, description, cost_points, stock, active")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catalog</h1>
        <button className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700">
          New item
        </button>
      </div>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-right">Cost</th>
              <th className="p-3 text-right">Stock</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-neutral-500">{c.description}</td>
                <td className="p-3 text-right font-mono">{c.cost_points}</td>
                <td className="p-3 text-right font-mono">
                  {c.stock === -1 ? "∞" : c.stock}
                </td>
                <td className="p-3">{c.active ? "✓" : "—"}</td>
              </tr>
            )) ?? null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
