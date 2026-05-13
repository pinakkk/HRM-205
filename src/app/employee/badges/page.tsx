import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Award, Lock } from "lucide-react";
import { BadgesRealtimeRefresh } from "./realtime-refresh";

export const dynamic = "force-dynamic";

const RARITY_STYLES: Record<string, { ring: string; bg: string; text: string }> = {
  bronze: {
    ring: "ring-amber-200",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-300",
  },
  silver: {
    ring: "ring-neutral-300",
    bg: "bg-neutral-100 dark:bg-neutral-800",
    text: "text-neutral-700 dark:text-neutral-300",
  },
  gold: {
    ring: "ring-yellow-300",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  platinum: {
    ring: "ring-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-700 dark:text-indigo-300",
  },
};

export default async function BadgesPage() {
  const me = await requireUser();
  const supabase = await createClient();

  const [{ data: allBadges }, { data: earned }] = await Promise.all([
    supabase.from("badges").select("id, code, name, description, rarity").order("rarity"),
    supabase.from("user_badges").select("badge_id, awarded_at").eq("user_id", me.profile.id),
  ]);

  const earnedMap = new Map((earned ?? []).map((e) => [e.badge_id, e.awarded_at]));
  const items = (allBadges ?? []).map((b) => ({ ...b, awarded_at: earnedMap.get(b.id) ?? null }));
  const earnedCount = items.filter((i) => i.awarded_at).length;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <BadgesRealtimeRefresh userId={me.profile.id} />
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Badges & Achievements</h1>
        <p className="text-sm text-neutral-500">
          {earnedCount} of {items.length} unlocked. Keep it up — new badges unlock as you hit milestones.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((b) => {
          const rarity = (b.rarity ?? "bronze") as keyof typeof RARITY_STYLES;
          const style = RARITY_STYLES[rarity] ?? RARITY_STYLES.bronze;
          const earned = Boolean(b.awarded_at);
          return (
            <div
              key={b.id}
              className={`rounded-xl border border-neutral-200 bg-white p-5 transition dark:bg-neutral-900 dark:border-neutral-800 ${earned ? "" : "opacity-70"}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ring-4 ${style.ring} ${style.bg} ${style.text}`}
                >
                  {earned ? <Award className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-neutral-900 dark:text-white">{b.name}</h3>
                    <span className={`text-[10px] uppercase tracking-wider ${style.text}`}>{rarity}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{b.description ?? "—"}</p>
                  <div className="mt-3 text-[11px] text-neutral-500">
                    {earned
                      ? `Earned ${new Date(b.awarded_at as string).toLocaleDateString()}`
                      : "Locked"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500 dark:border-neutral-700">
          No badges defined yet. Ask HR to seed some.
        </div>
      )}
    </div>
  );
}
