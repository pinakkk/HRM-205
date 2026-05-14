"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";

type Peer = { id: string; full_name: string; department: string | null };

export function ComposeFeedbackForm({ peers }: { peers: Peer[] }) {
  const router = useRouter();
  const [toUserId, setToUserId] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const trimmed = body.trim();
  const canSubmit = toUserId !== "" && trimmed.length >= 3 && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to_user_id: toUserId, body: trimmed }),
      });
      const json = (await res.json().catch(() => null)) as { title?: string; detail?: string } | null;
      if (!res.ok) {
        setError(json?.detail || json?.title || "Failed to send feedback.");
        return;
      }
      setBody("");
      setToUserId("");
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (peers.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-neutral-500">
        No teammates available to send feedback to yet.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border bg-white dark:bg-neutral-900 dark:border-neutral-800">
      <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
        <h2 className="font-semibold text-neutral-900 dark:text-white">Send feedback</h2>
        <p className="text-xs text-neutral-500">
          The recipient won&apos;t see your name — only HR can.
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <label htmlFor="fb-to" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Recipient
          </label>
          <select
            id="fb-to"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            disabled={submitting}
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">Select a teammate…</option>
            {peers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
                {p.department ? ` · ${p.department}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fb-body" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Message
          </label>
          <textarea
            id="fb-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={submitting}
            rows={4}
            maxLength={2000}
            placeholder="What went well, or what could be better?"
            className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
            <span>{trimmed.length < 3 ? "Min 3 characters" : " "}</span>
            <span>{body.length} / 2000</span>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            Feedback sent. Sentiment will appear in HR&apos;s view shortly.
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? "Sending…" : "Send feedback"}
          </button>
        </div>
      </div>
    </form>
  );
}
