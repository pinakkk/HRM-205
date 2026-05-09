import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { NewCycleButton } from "./new-cycle-button";

export default async function AllocatorIndex() {
  const supabase = await createClient();
  const { data: cycles } = await supabase
    .from("allocation_cycles")
    .select("id, label, pool_amount, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Bonus Allocator</h1>
        <NewCycleButton />
      </div>
      <p className="text-sm text-neutral-500">
        Define a pool, generate suggestions, review rationales, and publish to the ledger.
      </p>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
            <tr>
              <th className="p-3">Cycle</th>
              <th className="p-3">Pool</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cycles?.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium">{c.label}</td>
                <td className="p-3 font-mono">₹{Number(c.pool_amount).toLocaleString("en-IN")}</td>
                <td className="p-3 capitalize">{c.status}</td>
                <td className="p-3 text-neutral-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <Link
                    className="text-indigo-600 hover:underline"
                    href={`/admin/allocator/${c.id}`}
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            )) ?? null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
