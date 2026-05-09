import { ok } from "@/lib/http";
import { cacheInvalidate, cacheKeys } from "@/lib/redis";
import { createAdminClient } from "@/lib/supabase/admin";
import { attendanceJumpFlags, feedbackSkewFlags } from "@/lib/audit/anomalies";

export async function GET() {
  await cacheInvalidate(cacheKeys.auditSummary(), "audit:narration");

  let inserted = 0;
  try {
    const admin = createAdminClient();

    const sinceMs = Date.now() - 28 * 24 * 60 * 60 * 1000;
    const since = new Date(sinceMs).toISOString();

    const [{ data: attendance }, { data: feedback }] = await Promise.all([
      admin.from("attendance").select("user_id, check_in").gte("check_in", since),
      admin.from("feedback").select("from_user_id, sentiment").not("sentiment", "is", null),
    ]);

    const attendanceFlags = attendanceJumpFlags(attendance ?? []);
    const feedbackFlags = feedbackSkewFlags(feedback ?? []);

    const rows = [
      ...attendanceFlags.map((f) => ({
        metric: "attendance_jump",
        group_label: f.user_id,
        value: f.ratio,
        threshold: 2,
        flagged: true,
        details: { user_id: f.user_id, ratio: f.ratio },
      })),
      ...feedbackFlags.map((f) => ({
        metric: "feedback_skew",
        group_label: f.from_user_id,
        value: f.ratio,
        threshold: 0.9,
        flagged: true,
        details: { from_user_id: f.from_user_id, sentiment: f.sentiment, n: f.n },
      })),
    ];

    if (rows.length > 0) {
      const { error } = await admin.from("audit_findings").insert(rows);
      if (!error) inserted = rows.length;
    }
  } catch {
    // best-effort cron — don't 500 the scheduler
  }

  return ok({ status: "invalidated", findings_inserted: inserted });
}
