import { describe, expect, it } from "vitest";
import { attendanceJumpFlags, feedbackSkewFlags } from "@/lib/audit/anomalies";

describe("attendanceJumpFlags", () => {
  it("flags users whose recent attendance ≥ 2x the prior window", () => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const records = [
      // recent (10 in last 14 days)
      ...Array.from({ length: 10 }).map((_, i) => ({
        user_id: "u1",
        check_in: new Date(now - i * day).toISOString(),
      })),
      // prior (3 in 15-28 days ago)
      ...Array.from({ length: 3 }).map((_, i) => ({
        user_id: "u1",
        check_in: new Date(now - (15 + i) * day).toISOString(),
      })),
      // u2: balanced
      ...Array.from({ length: 5 }).map((_, i) => ({
        user_id: "u2",
        check_in: new Date(now - i * day).toISOString(),
      })),
      ...Array.from({ length: 5 }).map((_, i) => ({
        user_id: "u2",
        check_in: new Date(now - (15 + i) * day).toISOString(),
      })),
    ];
    const flags = attendanceJumpFlags(records);
    expect(flags.find((f) => f.user_id === "u1")).toBeDefined();
    expect(flags.find((f) => f.user_id === "u2")).toBeUndefined();
  });
});

describe("feedbackSkewFlags", () => {
  it("flags managers whose sentiment is ≥ 90% one-sided", () => {
    const rows = [
      ...Array.from({ length: 9 }).map(() => ({
        from_user_id: "m1",
        sentiment: "negative",
      })),
      { from_user_id: "m1", sentiment: "neutral" },
      ...Array.from({ length: 5 }).map(() => ({
        from_user_id: "m2",
        sentiment: "positive",
      })),
      ...Array.from({ length: 5 }).map(() => ({
        from_user_id: "m2",
        sentiment: "neutral",
      })),
    ];
    const flags = feedbackSkewFlags(rows);
    expect(flags.find((f) => f.from_user_id === "m1" && f.sentiment === "negative")).toBeDefined();
    expect(flags.find((f) => f.from_user_id === "m2")).toBeUndefined();
  });

  it("ignores managers with < 5 messages", () => {
    const rows = [
      { from_user_id: "m1", sentiment: "positive" },
      { from_user_id: "m1", sentiment: "positive" },
    ];
    expect(feedbackSkewFlags(rows)).toEqual([]);
  });
});
