"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogIn, QrCode } from "lucide-react";
import { toasts } from "@/components/ui/Toaster";

export function CheckInCard({ checkedIn }: { checkedIn: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [qrToken, setQrToken] = useState("");

  async function checkIn() {
    setBusy(true);
    try {
      const res = await fetch("/api/attendance/check-in", { method: "POST" });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail ?? b.title ?? "Check-in failed");
      }
      toasts.success("Checked in.");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function checkInQr(e: React.FormEvent) {
    e.preventDefault();
    if (!qrToken.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/attendance/qr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: qrToken.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail ?? body.title ?? "QR check-in failed");
      toasts.success(body.status === "already-checked-in" ? "You're already checked in today." : "Checked in via QR.");
      setQrToken("");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "QR check-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-indigo-50 to-white p-6 dark:border-neutral-800 dark:from-indigo-900/20 dark:to-neutral-900">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {checkedIn ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <LogIn className="h-4 w-4 text-indigo-600" />}
            {checkedIn ? "You're checked in for today." : "Not checked in yet."}
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Use the button below or scan the office QR code (paste the token).
          </p>
        </div>
        <button
          onClick={checkIn}
          disabled={busy || checkedIn}
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {checkedIn ? "Checked in" : busy ? "Working…" : "Check in now"}
        </button>
      </div>

      <form onSubmit={checkInQr} className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
          <QrCode className="h-4 w-4 text-neutral-500" />
          <input
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
            placeholder="Paste QR token (e.g. 7129843.ab12cd34ef567890)"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !qrToken.trim() || checkedIn}
          className="rounded-md border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-900/40 dark:bg-neutral-900 dark:text-indigo-300"
        >
          QR check-in
        </button>
      </form>
    </div>
  );
}
