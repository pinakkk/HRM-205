"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Bell, Coins, Gift, Megaphone, MessageSquare } from "lucide-react";
import { toasts } from "@/components/ui/Toaster";

type Item = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const ICONS: Record<string, React.ReactNode> = {
  reward: <Coins className="h-4 w-4" />,
  bonus: <Gift className="h-4 w-4" />,
  feedback: <MessageSquare className="h-4 w-4" />,
  badge: <Award className="h-4 w-4" />,
  announcement: <Megaphone className="h-4 w-4" />,
  system: <Bell className="h-4 w-4" />,
};

export function NotificationsList({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const unreadCount = items.filter((i) => !i.read_at).length;

  async function markAll() {
    if (unreadCount === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/me/notifications/read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed");
      const now = new Date().toISOString();
      setItems(items.map((i) => (i.read_at ? i : { ...i, read_at: now })));
      router.refresh();
    } catch {
      toasts.error("Failed to mark as read.");
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500 dark:border-neutral-700">
        Nothing yet. New rewards, feedback, and announcements will show up here.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
        <div className="text-sm">
          <span className="font-semibold text-neutral-900 dark:text-white">{unreadCount}</span>
          <span className="ml-1 text-neutral-500">unread of {items.length}</span>
        </div>
        <button
          onClick={markAll}
          disabled={busy || unreadCount === 0}
          className="rounded-md border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Mark all as read
        </button>
      </div>
      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {items.map((n) => {
          const body = (
            <div className={`flex items-start gap-3 px-5 py-4 ${n.read_at ? "" : "bg-indigo-50/50 dark:bg-indigo-900/10"}`}>
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {ICONS[n.type] ?? <Bell className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-neutral-900 dark:text-white truncate">{n.title}</div>
                  <div className="text-[10px] text-neutral-500 shrink-0">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                {n.body && <div className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">{n.body}</div>}
              </div>
            </div>
          );
          return (
            <li key={n.id}>
              {n.link ? (
                <Link href={n.link} className="block hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
