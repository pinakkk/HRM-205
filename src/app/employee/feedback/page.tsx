import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SentimentChip } from "@/components/feedback/SentimentChip";

export default async function FeedbackPage() {
  const me = await requireUser();
  const supabase = await createClient();

  const { data: received } = await supabase
    .from("feedback")
    .select("id, body, sentiment, created_at, from_user_id")
    .eq("to_user_id", me.profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Feedback inbox</h1>
      <p className="text-sm text-neutral-500">
        Anonymous to you — only HR sees the sender.
      </p>
      <div className="rounded-md border">
        {received?.length ? (
          <ul className="divide-y">
            {received.map((row) => (
              <li key={row.id} className="p-4">
                <div className="flex items-center justify-between">
                  <SentimentChip sentiment={row.sentiment} />
                  <span className="text-xs text-neutral-500">
                    {new Date(row.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm">{row.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center text-sm text-neutral-500">
            No feedback yet.
          </div>
        )}
      </div>
    </div>
  );
}
