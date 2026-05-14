import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SentimentChip } from "@/components/feedback/SentimentChip";
import { ComposeFeedbackForm } from "./compose-form";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const me = await requireUser();
  const supabase = await createClient();

  const [receivedRes, sentRes, peersRes] = await Promise.all([
    supabase
      .from("feedback")
      .select("id, body, sentiment, created_at")
      .eq("to_user_id", me.profile.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("feedback")
      .select("id, body, sentiment, created_at, to_user_id")
      .eq("from_user_id", me.profile.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("leaderboard")
      .select("user_id, full_name, department")
      .neq("user_id", me.profile.id)
      .order("full_name", { ascending: true })
      .limit(500),
  ]);

  const received = receivedRes.data ?? [];
  const sent = sentRes.data ?? [];
  const peers = (peersRes.data ?? [])
    .filter((p): p is { user_id: string; full_name: string; department: string | null } =>
      typeof p.user_id === "string" && typeof p.full_name === "string",
    )
    .map((p) => ({
      id: p.user_id,
      full_name: p.full_name,
      department: p.department,
    }));
  const peerNameById = new Map(peers.map((p) => [p.id, p.full_name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Feedback</h1>
        <p className="text-sm text-neutral-500">
          Share anonymous, constructive notes with teammates. Recipients don&apos;t see your name — only HR can.
        </p>
      </div>

      <ComposeFeedbackForm peers={peers} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Inbox</h2>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500">{received.length}</span>
          </div>
          {received.length > 0 ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {received.map((row) => (
                <li key={row.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <SentimentChip sentiment={row.sentiment} />
                    <span className="text-xs text-neutral-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-200">{row.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-neutral-500">No feedback received yet.</div>
          )}
        </section>

        <section className="rounded-md border bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Sent</h2>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500">{sent.length}</span>
          </div>
          {sent.length > 0 ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {sent.map((row) => (
                <li key={row.id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      To {peerNameById.get(row.to_user_id) ?? "teammate"}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <SentimentChip sentiment={row.sentiment} />
                  </div>
                  <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-200">{row.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-neutral-500">You haven&apos;t sent any feedback yet.</div>
          )}
        </section>
      </div>
    </div>
  );
}
