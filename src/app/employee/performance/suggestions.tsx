"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { toasts } from "@/components/ui/Toaster";

type Suggestion = { headline: string; tips: string[]; source: "ai" | "fallback" };

export function SuggestionsPanel() {
  const [data, setData] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/me/suggestions", { method: "GET" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? "Failed");
      }
      setData(await res.json());
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 dark:border-indigo-900/40 dark:from-indigo-900/20 dark:to-neutral-900">
      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
        <Sparkles className="h-5 w-5" />
        <h3 className="font-bold">AI improvement tips</h3>
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        Personalised tips based on your KPIs, attendance, and recent feedback.
      </p>

      {!data ? (
        <button
          onClick={load}
          disabled={loading}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            "Generate suggestions"
          )}
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">{data.headline}</p>
          <ul className="space-y-2">
            {data.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
          {data.source === "fallback" && (
            <p className="text-[10px] italic text-neutral-400">
              AI service unavailable — showing rule-based tips.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
