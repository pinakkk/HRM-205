import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementComposer } from "./composer";
import { Megaphone, Pin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("announcements")
    .select("id, title, body, audience, pinned, published_at, author_id")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(50);

  const authorIds = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
  const { data: authors } = authorIds.length
    ? await supabase.from("users").select("id, full_name").in("id", authorIds)
    : { data: [] as { id: string; full_name: string }[] };
  const authorMap = new Map((authors ?? []).map((a) => [a.id, a.full_name]));
  const data = (rows ?? []).map((r) => ({ ...r, author_name: authorMap.get(r.author_id) ?? null }));

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Announcements</h1>
        <p className="text-sm text-neutral-500">Broadcast notices to all employees or a single department.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AnnouncementComposer />
        </div>
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white">Recent announcements</h3>
            <span className="text-xs text-neutral-500">{data.length} total</span>
          </div>
          {data.length ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {data.map((a) => (
                <li key={a.id} className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {a.pinned && <Pin className="h-3.5 w-3.5 text-amber-500" />}
                    <div className="font-bold text-neutral-900 dark:text-white">{a.title}</div>
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-neutral-500">{a.audience}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{a.body}</p>
                  <div className="mt-2 text-[11px] text-neutral-500">
                    {a.author_name ? `${a.author_name} · ` : ""}
                    {new Date(a.published_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <Megaphone className="h-8 w-8 text-neutral-400" />
              <p className="text-sm text-neutral-500">No announcements yet — compose the first one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
