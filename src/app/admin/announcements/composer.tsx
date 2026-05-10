"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toasts } from "@/components/ui/Toaster";

const AUDIENCES = ["all", "engineering", "sales", "marketing", "hr", "finance"] as const;

export function AnnouncementComposer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>("all");
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), audience, pinned }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail ?? b.title ?? "Save failed");
      }
      toasts.success("Announcement published.");
      setTitle("");
      setBody("");
      setPinned(false);
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={6}
          maxLength={2000}
          className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Audience</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as typeof audience)}
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          Pin to top
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting || !title.trim() || !body.trim()}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Publishing…" : "Publish"}
      </button>
    </form>
  );
}
