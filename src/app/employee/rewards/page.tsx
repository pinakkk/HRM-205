import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";
import {
  Trophy,
  History,
  ShoppingBag,
  BadgeDollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Search,
  Filter
} from "lucide-react";
import Link from "next/link";

export default async function RewardsPage() {
  const me = await requireUser();
  const supabase = await createClient();

  // Fetch points balance
  const { data: balance } = await supabase
    .from("points_balance")
    .select("balance, bonus_total, lifetime_total")
    .eq("user_id", me.profile.id)
    .maybeSingle();

  // Fetch reward history (ledger)
  const { data: history } = await supabase
    .from("rewards_ledger")
    .select("id, kind, amount, reason, created_at")
    .eq("user_id", me.profile.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch available rewards (catalog)
  const { data: catalog } = await supabase
    .from("catalog_items")
    .select("*")
    // .eq("is_active", true)
    .limit(4);

  const redeemedPoints = (balance?.lifetime_total ?? 0) - (balance?.balance ?? 0);

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Rewards & Points</h1>
          <p className="text-sm text-neutral-500">Manage your earned points and explore available rewards.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/employee/store"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <ShoppingBag className="h-4 w-4" />
            Go to Store
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold text-neutral-500">Total Earned Points</div>
          <div className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">
            {formatPoints(balance?.lifetime_total ?? 0)}
          </div>
          <div className="mt-2 text-xs font-medium text-green-600 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> +12% from last cycle
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold text-neutral-500">Redeemed Points</div>
          <div className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">
            {formatPoints(redeemedPoints)}
          </div>
          <div className="mt-2 text-xs font-medium text-neutral-400 italic">
            Used for {Math.floor(redeemedPoints / 500)} rewards
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-indigo-600 p-6 shadow-lg shadow-indigo-100 dark:shadow-none">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
            <BadgeDollarSign className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold text-indigo-100">Current Balance</div>
          <div className="mt-1 text-3xl font-extrabold text-white">
            {formatPoints(balance?.balance ?? 0)}
          </div>
          <div className="mt-2 text-xs font-medium text-indigo-100">
            Ready to be redeemed
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reward History */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <History className="h-5 w-5 text-neutral-400" /> Reward History
            </h3>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View all</button>
          </div>
          <div className="space-y-4">
            {history?.length ? (
              history.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-4 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      Number(item.amount) > 0 ? "bg-green-50 text-green-600 dark:bg-green-900/20" : "bg-red-50 text-red-600 dark:bg-red-900/20"
                    )}>
                      {Number(item.amount) > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white capitalize">{item.reason}</h4>
                      <p className="text-[10px] text-neutral-500">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "text-sm font-bold",
                    Number(item.amount) > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {Number(item.amount) > 0 ? "+" : ""}{item.amount}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-neutral-500">No transactions yet.</div>
            )}
          </div>
        </div>

        {/* Available Rewards */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <Gift className="h-5 w-5 text-neutral-400" /> Available Rewards
            </h3>
            <div className="flex gap-2">
              <button className="rounded-md border border-neutral-200 p-1.5 hover:bg-neutral-50 dark:border-neutral-800">
                <Search className="h-3.5 w-3.5 text-neutral-500" />
              </button>
              <button className="rounded-md border border-neutral-200 p-1.5 hover:bg-neutral-50 dark:border-neutral-800">
                <Filter className="h-3.5 w-3.5 text-neutral-500" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {catalog?.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition-all hover:border-indigo-100 hover:bg-indigo-50/30 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-indigo-900/30">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm dark:bg-neutral-900">
                  <Gift className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{item.name}</h4>
                <p className="mt-1 text-[10px] text-neutral-500 line-clamp-2">{item.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs font-extrabold text-indigo-600">{item.price} pts</div>
                  <button className="rounded-lg bg-white px-3 py-1 text-[10px] font-bold text-neutral-900 shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-colors dark:bg-neutral-900 dark:text-white dark:border-neutral-800">
                    Redeem
                  </button>
                </div>
              </div>
            ))}
            {!catalog?.length && (
              <div className="col-span-2 py-10 text-center text-sm text-neutral-500">No rewards available in the catalog.</div>
            )}
          </div>

          <Link
            href="/employee/store"
            className="mt-6 block w-full rounded-xl border border-dashed border-neutral-300 py-3 text-center text-xs font-bold text-neutral-500 hover:border-indigo-300 hover:text-indigo-600 transition-all dark:border-neutral-700"
          >
            View Full Reward Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
