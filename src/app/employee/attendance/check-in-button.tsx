"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CheckInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/attendance/check-in", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setMsg(data.error ?? "Check-in failed.");
    else {
      setMsg("Checked in ✓");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Checking in…" : "Check in for today"}
      </button>
      {msg && <span className="text-sm text-neutral-600">{msg}</span>}
    </div>
  );
}
