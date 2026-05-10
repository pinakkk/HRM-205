"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

type Item = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const POLL_MS = 30_000;

export function NotificationBell() {
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch("/api/me/notifications?limit=8", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { items: Item[]; unread: number };
        if (!cancelled) {
          setItems(json.items);
          setUnread(json.unread);
        }
      } catch {
        /* ignore */
      }
    }
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markAll() {
    if (unread === 0) return;
    await fetch("/api/me/notifications/read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const now = new Date().toISOString();
    setItems((s) => s.map((i) => (i.read_at ? i : { ...i, read_at: now })));
    setUnread(0);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Notifications</span>
            <button
              onClick={markAll}
              disabled={unread === 0}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
            >
              Mark all read
            </button>
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-neutral-500">You're all caught up.</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
              {items.map((n) => {
                const inner = (
                  <div className={`px-3 py-2 ${n.read_at ? "" : "bg-indigo-50/50 dark:bg-indigo-900/10"}`}>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white">{n.title}</div>
                    {n.body && <div className="mt-0.5 text-[11px] text-neutral-500">{n.body}</div>}
                    <div className="mt-0.5 text-[10px] text-neutral-400">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link onClick={() => setOpen(false)} href={n.link} className="block hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href="/employee/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-neutral-100 px-3 py-2 text-center text-xs font-semibold text-indigo-600 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
