import { describe, it, expect } from "vitest";
import { currentStreak, attendancePercent } from "@/lib/streaks";

function dayAgo(n: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

describe("streaks", () => {
  it("zero check-ins → zero streak", () => {
    expect(currentStreak([])).toBe(0);
  });
  it("returns at least 1 when checked in across the past week of workdays", () => {
    const ins: string[] = [];
    for (let i = 0; i < 7; i++) ins.push(dayAgo(i));
    expect(currentStreak(ins)).toBeGreaterThanOrEqual(1);
  });
  it("attendancePercent in 30 day window is bounded", () => {
    const ins: string[] = [];
    for (let i = 0; i < 30; i++) ins.push(dayAgo(i));
    const pct = attendancePercent(ins, 30);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
  it("attendancePercent of empty input is 0", () => {
    expect(attendancePercent([], 30)).toBe(0);
  });
});
