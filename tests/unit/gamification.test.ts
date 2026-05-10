import { describe, it, expect } from "vitest";
import { levelFromPoints, progressToNext } from "@/lib/gamification";

describe("gamification levels", () => {
  it("returns Beginner for 0", () => {
    expect(levelFromPoints(0).tier).toBe("Beginner");
  });
  it("returns Performer at 500", () => {
    expect(levelFromPoints(500).tier).toBe("Performer");
  });
  it("returns Achiever at 2000", () => {
    expect(levelFromPoints(2000).tier).toBe("Achiever");
  });
  it("returns Champion at 10000", () => {
    expect(levelFromPoints(10000).tier).toBe("Champion");
    expect(levelFromPoints(10000).next).toBeNull();
  });
  it("progress between tiers is monotonic", () => {
    expect(progressToNext(0)).toBeCloseTo(0, 5);
    expect(progressToNext(250)).toBeGreaterThan(0);
    expect(progressToNext(499)).toBeLessThan(1);
    expect(progressToNext(500)).toBeCloseTo(0, 5);
    expect(progressToNext(10000)).toBe(1);
  });
});
