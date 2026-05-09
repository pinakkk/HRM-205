type Sentiment = "positive" | "neutral" | "constructive" | "negative" | null;

const TONE: Record<Exclude<Sentiment, null>, string> = {
  positive:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  neutral:
    "border-neutral-300 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
  constructive:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
  negative:
    "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300",
};

export function SentimentChip({ sentiment }: { sentiment: Sentiment }) {
  if (!sentiment) {
    return (
      <span className="rounded-full border border-dashed border-neutral-300 px-2 py-0.5 text-[10px] uppercase text-neutral-500">
        scoring…
      </span>
    );
  }
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${TONE[sentiment]}`}
    >
      {sentiment}
    </span>
  );
}
