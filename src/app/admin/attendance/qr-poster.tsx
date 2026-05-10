"use client";

import { useEffect, useState } from "react";
import { QrCode, RefreshCw } from "lucide-react";

type Token = { token: string; expiresAt: number };

export function QrPoster() {
  const [data, setData] = useState<Token | null>(null);
  const [now, setNow] = useState(Date.now());

  async function load() {
    const res = await fetch("/api/admin/attendance/qr-token", { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!data) return;
    const ms = data.expiresAt - Date.now();
    if (ms <= 0) {
      load();
      return;
    }
    const t = setTimeout(load, ms + 500);
    return () => clearTimeout(t);
  }, [data]);

  const remaining = data ? Math.max(0, Math.floor((data.expiresAt - now) / 1000)) : 0;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <QrCode className="h-5 w-5 text-indigo-600" />
        <h3 className="font-bold text-neutral-900 dark:text-white">QR check-in token</h3>
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        Print or display this token on the office TV. It rotates every 5 minutes — employees paste it into their attendance page.
      </p>
      <div className="mt-4 rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50 p-6 text-center dark:border-indigo-900/40 dark:bg-indigo-900/20">
        <div className="text-[10px] uppercase tracking-widest text-indigo-700 dark:text-indigo-300">Current token</div>
        <div className="mt-2 break-all font-mono text-base font-bold text-indigo-900 dark:text-indigo-100">
          {data?.token ?? "loading…"}
        </div>
        <div className="mt-3 text-[11px] text-indigo-700/70 dark:text-indigo-300/70">
          Expires in {remaining}s
        </div>
      </div>
      <button
        onClick={load}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
      >
        <RefreshCw className="h-3 w-3" /> Refresh
      </button>
    </div>
  );
}
