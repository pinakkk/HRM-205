import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  FeedbackStats,
  ProvideFeedback,
  EmployeeReviewSystem,
  type ReviewItem,
  type SentimentTotals,
} from "./feedback-admin-components";
import { Bell, Search } from "lucide-react";

export const dynamic = "force-dynamic";

type Sentiment = "positive" | "neutral" | "constructive" | "negative" | null;

type FeedbackRow = {
  id: number;
  body: string;
  sentiment: Sentiment;
  sentiment_score: number | null;
  created_at: string;
  from_user_id: string;
  to_user_id: string;
};

export default async function AdminFeedbackPage() {
  await requireAdmin();
  const supabase = await createClient();

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { data: feedbackRows } = await supabase
    .from("feedback")
    .select("id, body, sentiment, sentiment_score, created_at, from_user_id, to_user_id")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (feedbackRows ?? []) as FeedbackRow[];

  const userIds = Array.from(
    new Set(rows.flatMap((r) => [r.from_user_id, r.to_user_id])),
  );

  const { data: usersData } = userIds.length
    ? await supabase
        .from("users")
        .select("id, full_name, email, role, department")
        .in("id", userIds)
    : { data: [] as Array<{ id: string; full_name: string; email: string; role: string; department: string | null }> };

  const userMap = new Map(
    (usersData ?? []).map((u) => [
      u.id,
      {
        full_name: u.full_name ?? u.email,
        email: u.email,
        role: u.role,
        department: u.department,
      },
    ]),
  );

  const { data: peersData } = await supabase
    .from("users")
    .select("id, full_name, email, department")
    .order("full_name", { ascending: true })
    .limit(500);

  const peers = (peersData ?? []).map((u) => ({
    id: u.id,
    full_name: u.full_name ?? u.email,
    department: u.department,
  }));

  const totals: SentimentTotals = {
    positive: 0,
    neutral: 0,
    constructive: 0,
    negative: 0,
    unclassified: 0,
    total: rows.length,
  };
  for (const r of rows) {
    if (r.sentiment === "positive") totals.positive++;
    else if (r.sentiment === "neutral") totals.neutral++;
    else if (r.sentiment === "constructive") totals.constructive++;
    else if (r.sentiment === "negative") totals.negative++;
    else totals.unclassified++;
  }

  const reviews: ReviewItem[] = rows.slice(0, 30).map((r) => {
    const reviewer = userMap.get(r.from_user_id);
    const recipient = userMap.get(r.to_user_id);
    return {
      id: r.id,
      employee: recipient?.full_name ?? "Unknown",
      employee_department: recipient?.department ?? null,
      reviewer: reviewer?.full_name ?? "Unknown",
      reviewer_role: reviewer?.role === "admin" ? "Admin" : "Peer",
      created_at: r.created_at,
      body: r.body,
      sentiment: r.sentiment,
      sentiment_score: r.sentiment_score,
    };
  });

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Feedback &amp; Reviews
          </h1>
          <p className="text-sm text-neutral-500">
            Peer feedback across the company, with sentiment classification ({today})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              className="h-10 w-64 rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>

      <FeedbackStats totals={totals} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EmployeeReviewSystem reviews={reviews} />
        </div>

        <div className="flex flex-col gap-6">
          <ProvideFeedback peers={peers} />
        </div>
      </div>
    </div>
  );
}
