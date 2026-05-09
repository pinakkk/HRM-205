import { describe, expect, it } from "vitest";
import {
  anovaF,
  disparateImpactRatio,
  managerSkew,
  pairwiseDIR,
} from "@/lib/audit/disparate-impact";

describe("disparateImpactRatio", () => {
  it("flags ratio < 0.8 (4/5ths rule)", () => {
    const r = disparateImpactRatio([100, 110, 90], [200, 210, 190]);
    expect(r.flagged).toBe(true);
    expect(r.ratio).toBeLessThan(0.8);
  });

  it("does not flag near-parity groups", () => {
    const r = disparateImpactRatio([100, 110], [105, 95]);
    expect(r.flagged).toBe(false);
  });

  it("guards against zero divisor", () => {
    const r = disparateImpactRatio([100], []);
    expect(r.ratio).toBeNull();
    expect(r.flagged).toBe(false);
  });
});

describe("pairwiseDIR", () => {
  it("compares each group against the highest-mean reference", () => {
    const rows = pairwiseDIR({ A: [100, 110], B: [50, 60], C: [120] });
    expect(rows.find((r) => r.group === "B")?.flagged).toBe(true);
    expect(rows.every((r) => r.reference === "C")).toBe(true);
  });

  it("returns [] when no groups present", () => {
    expect(pairwiseDIR({})).toEqual([]);
  });
});

describe("anovaF", () => {
  it("flags clearly-different groups", () => {
    const f = anovaF({ A: [10, 11, 9, 10], B: [50, 49, 51, 50], C: [100, 99, 101, 100] });
    expect(f.f).not.toBeNull();
    expect(f.flagged).toBe(true);
  });

  it("does not flag homogeneous groups", () => {
    const f = anovaF({ A: [50, 51, 49], B: [50, 51, 49], C: [50, 51, 49] });
    expect(f.flagged).toBe(false);
  });
});

describe("managerSkew", () => {
  it("flags z-scores > 2", () => {
    const skew = managerSkew({
      m1: [0.05],
      m2: [0.06],
      m3: [0.04],
      m4: [0.05],
      m5: [0.06],
      m6: [0.04],
      m7: [0.05],
      m8: [0.05],
      outlier: [0.95],
    });
    expect(skew.find((m) => m.manager_id === "outlier")?.flagged).toBe(true);
  });
});
