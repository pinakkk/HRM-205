"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SentimentChip } from "@/components/feedback/SentimentChip";
import { toasts } from "@/components/ui/Toaster";

type Sentiment = "positive" | "neutral" | "constructive" | "negative" | null;

export type SentimentTotals = {
  positive: number;
  neutral: number;
  constructive: number;
  negative: number;
  unclassified: number;
  total: number;
};

export type ReviewItem = {
  id: number;
  employee: string;
  employee_department: string | null;
  reviewer: string;
  reviewer_role: string;
  created_at: string;
  body: string;
  sentiment: Sentiment;
  sentiment_score: number | null;
};

export type Peer = {
  id: string;
  full_name: string;
  department: string | null;
};

function pct(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function FeedbackStats({ totals }: { totals: SentimentTotals }) {
  const classifiedTotal =
    totals.positive + totals.neutral + totals.constructive + totals.negative;
  const stats = [
    {
      label: "Positive",
      value: pct(totals.positive, classifiedTotal),
      sub: `${totals.positive} of ${classifiedTotal} classified`,
      icon: <ThumbsUp className="h-5 w-5 text-emerald-600" />,
      bgColor: "bg-emerald-50",
    },
    {
      label: "Neutral",
      value: pct(totals.neutral, classifiedTotal),
      sub: `${totals.neutral} entries`,
      icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      label: "Constructive",
      value: pct(totals.constructive, classifiedTotal),
      sub: `${totals.constructive} entries`,
      icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
      bgColor: "bg-amber-50",
    },
    {
      label: "Negative",
      value: pct(totals.negative, classifiedTotal),
      sub: `${totals.negative} entries`,
      icon: <ThumbsDown className="h-5 w-5 text-rose-600" />,
      bgColor: "bg-rose-50",
    },
    {
      label: "Total Feedback",
      value: String(totals.total),
      sub:
        totals.unclassified > 0
          ? `${totals.unclassified} awaiting sentiment`
          : "All classified",
      icon: <Inbox className="h-5 w-5 text-indigo-600" />,
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="mb-4 flex items-center justify-between">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                stat.bgColor,
              )}
            >
              {stat.icon}
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {stat.label}
          </p>
          <div className="mt-1 text-2xl font-black text-neutral-900 dark:text-white">
            {stat.value}
          </div>
          <p className="mt-1 text-[10px] text-neutral-500">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function ProvideFeedback({ peers }: { peers: Peer[] }) {
  const router = useRouter();
  const [employee, setEmployee] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!employee) {
      toasts.error("Pick an employee");
      return;
    }
    if (comment.trim().length < 3) {
      toasts.error("Feedback is too short");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to_user_id: employee, body: comment.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? "Failed");
      }
      toasts.success("Feedback sent");
      setEmployee("");
      setComment("");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          Provide Feedback
        </h3>
        <p className="text-xs text-neutral-500">
          Send feedback directly to an employee
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-neutral-400">
            Select Employee
          </label>
          <select
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-950"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          >
            <option value="">Choose an employee...</option>
            {peers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
                {p.department ? ` · ${p.department}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-neutral-400">
            Feedback Message
          </label>
          <textarea
            className="h-32 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-950"
            placeholder="Write your feedback here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white transition-all hover:bg-neutral-800 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {busy ? "Sending…" : "Send Feedback"}
        </button>
      </div>
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function EmployeeReviewSystem({ reviews }: { reviews: ReviewItem[] }) {
  const [filter, setFilter] = useState<"all" | Exclude<Sentiment, null>>("all");

  const filtered = reviews.filter((r) =>
    filter === "all" ? true : r.sentiment === filter,
  );

  const tones: Array<{ value: "all" | Exclude<Sentiment, null>; label: string }> = [
    { value: "all", label: "All" },
    { value: "positive", label: "Positive" },
    { value: "neutral", label: "Neutral" },
    { value: "constructive", label: "Constructive" },
    { value: "negative", label: "Negative" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 border-b border-neutral-50 p-6 dark:border-neutral-800 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            Employee Review System
          </h3>
          <p className="text-xs text-neutral-500">
            Peer feedback across the company, sorted by recency
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-1 text-xs dark:border-neutral-800 dark:bg-neutral-950">
          {tones.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFilter(t.value)}
              className={cn(
                "rounded px-2 py-1",
                filter === t.value
                  ? "bg-white font-semibold shadow-sm dark:bg-neutral-800 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-neutral-500">
          No feedback to show.
        </div>
      ) : (
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="p-6 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                    {r.employee.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {r.employee}
                      {r.employee_department ? (
                        <span className="ml-1 text-[10px] font-normal text-neutral-400">
                          · {r.employee_department}
                        </span>
                      ) : null}
                    </h4>
                    <p className="text-[10px] text-neutral-500">
                      from {r.reviewer} ({r.reviewer_role}) · {timeAgo(r.created_at)}
                    </p>
                  </div>
                </div>
                <SentimentChip sentiment={r.sentiment} />
              </div>
              <p className="text-sm italic leading-relaxed text-neutral-600 dark:text-neutral-300">
                &ldquo;{r.body}&rdquo;
              </p>
              {r.sentiment_score !== null ? (
                <div className="mt-2 text-[10px] text-neutral-400">
                  score {r.sentiment_score.toFixed(2)}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
