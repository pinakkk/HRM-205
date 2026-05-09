/**
 * Anomaly detectors — surface signals that warrant human review.
 * Pure functions; called from cron jobs and the audit dashboard.
 */

export type AttendanceRecord = { user_id: string; check_in: string };

/**
 * Flags users whose attendance count in the last `windowDays` is 2x their
 * preceding-window average — possible "review-period gaming".
 */
export function attendanceJumpFlags(
  records: AttendanceRecord[],
  windowDays = 14,
): { user_id: string; ratio: number }[] {
  const now = Date.now();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const counts = new Map<string, { recent: number; prior: number }>();

  for (const r of records) {
    const t = new Date(r.check_in).getTime();
    const bucket = counts.get(r.user_id) ?? { recent: 0, prior: 0 };
    if (now - t <= windowMs) bucket.recent++;
    else if (now - t <= windowMs * 2) bucket.prior++;
    counts.set(r.user_id, bucket);
  }

  const flags: { user_id: string; ratio: number }[] = [];
  for (const [user_id, { recent, prior }] of counts) {
    if (prior === 0) continue;
    const ratio = recent / prior;
    if (ratio >= 2) flags.push({ user_id, ratio });
  }
  return flags;
}

/**
 * Identifies feedback senders whose sentiment distribution is heavily
 * one-sided (>= 90% of their messages on one extreme).
 */
export function feedbackSkewFlags(
  rows: { from_user_id: string; sentiment: string | null }[],
): { from_user_id: string; sentiment: string; ratio: number; n: number }[] {
  const buckets = new Map<string, Record<string, number>>();
  for (const r of rows) {
    if (!r.sentiment) continue;
    const b = buckets.get(r.from_user_id) ?? {};
    b[r.sentiment] = (b[r.sentiment] ?? 0) + 1;
    buckets.set(r.from_user_id, b);
  }

  const flags: { from_user_id: string; sentiment: string; ratio: number; n: number }[] = [];
  for (const [from_user_id, b] of buckets) {
    const n = Object.values(b).reduce((s, x) => s + x, 0);
    if (n < 5) continue;
    for (const [sentiment, count] of Object.entries(b)) {
      const ratio = count / n;
      if (ratio >= 0.9) flags.push({ from_user_id, sentiment, ratio, n });
    }
  }
  return flags;
}
