"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CycleRowActions({
  cycleId,
  cycleLabel,
  status,
}: {
  cycleId: string;
  cycleLabel: string;
  status: "draft" | "published" | "closed";
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (status !== "draft") return;
    const confirmed = window.confirm(
      `Delete draft cycle "${cycleLabel}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/allocator/cycles", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cycle_id: cycleId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {status === "draft" && (
        <button
          onClick={onDelete}
          disabled={deleting}
          className="text-xs text-rose-600 hover:underline disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      )}
      <Link className="text-indigo-600 hover:underline" href={`/admin/allocator/${cycleId}`}>
        Open →
      </Link>
      {error && <span className="text-[10px] text-rose-600">{error}</span>}
    </div>
  );
}
