import { describe, expect, it } from "vitest";
import { clamp, equalSplit } from "@/lib/llm/allocator";
import type { Allocation, AllocatorInput } from "@/lib/llm/schemas";

const baseInput: AllocatorInput = {
  cycle_label: "test",
  pool_amount: 100000,
  employees: [
    {
      user_id: "11111111-1111-1111-1111-111111111111",
      full_name: "A",
      attendance_pct: 90,
      kpi_score: 80,
      peer_sentiment: 0.5,
      tenure_months: 24,
    },
    {
      user_id: "22222222-2222-2222-2222-222222222222",
      full_name: "B",
      attendance_pct: 70,
      kpi_score: 50,
      peer_sentiment: 0.0,
      tenure_months: 6,
    },
  ],
};

describe("equalSplit", () => {
  it("KPI-weighted split sums to <= pool", () => {
    const a = equalSplit(baseInput);
    const total = a.allocations.reduce((s, x) => s + x.amount, 0);
    expect(total).toBeLessThanOrEqual(baseInput.pool_amount);
    expect(a.allocations).toHaveLength(2);
  });

  it("falls back to even split when all KPI scores are zero", () => {
    const input = {
      ...baseInput,
      employees: baseInput.employees.map((e) => ({ ...e, kpi_score: 0 })),
    };
    const a = equalSplit(input);
    expect(a.allocations[0].amount).toBeCloseTo(a.allocations[1].amount, 0);
  });
});

describe("clamp", () => {
  it("enforces 25% per-employee cap", () => {
    const allocation: Allocation = {
      cycle_label: "test",
      total_pool: 100000,
      pool_residual: 0,
      allocations: [
        {
          user_id: baseInput.employees[0].user_id,
          amount: 90000,
          rationale: "kpi_score=80 attendance=90",
          confidence: 0.9,
        },
        {
          user_id: baseInput.employees[1].user_id,
          amount: 10000,
          rationale: "kpi_score=50 attendance=70",
          confidence: 0.6,
        },
      ],
    };
    const out = clamp(allocation, baseInput);
    expect(out.allocations[0].amount).toBeLessThanOrEqual(25000);
  });

  it("scrubs forbidden tokens from rationale", () => {
    const allocation: Allocation = {
      cycle_label: "test",
      total_pool: 100000,
      pool_residual: 0,
      allocations: [
        {
          user_id: baseInput.employees[0].user_id,
          amount: 1000,
          rationale: "Strong performance regardless of gender or age.",
          confidence: 0.5,
        },
      ],
    };
    const out = clamp(allocation, baseInput);
    expect(out.allocations[0].rationale).not.toMatch(/gender/i);
    expect(out.allocations[0].rationale).not.toMatch(/age/i);
    expect(out.allocations[0].rationale).toContain("[redacted]");
  });

  it("drops user_ids not in input", () => {
    const allocation: Allocation = {
      cycle_label: "test",
      total_pool: 100000,
      pool_residual: 0,
      allocations: [
        {
          user_id: "33333333-3333-3333-3333-333333333333",
          amount: 5000,
          rationale: "KPI 80",
          confidence: 0.8,
        },
      ],
    };
    const out = clamp(allocation, baseInput);
    expect(out.allocations).toHaveLength(0);
  });

  it("scales down when total exceeds pool", () => {
    const allocation: Allocation = {
      cycle_label: "test",
      total_pool: 100000,
      pool_residual: 0,
      allocations: [
        {
          user_id: baseInput.employees[0].user_id,
          amount: 20000,
          rationale: "kpi_score=80",
          confidence: 0.8,
        },
        {
          user_id: baseInput.employees[1].user_id,
          amount: 20000,
          rationale: "kpi_score=50",
          confidence: 0.6,
        },
      ],
    };
    // Pool 30k, allocations sum 40k → must scale down to 30k.
    const tightInput = { ...baseInput, pool_amount: 30000 };
    const out = clamp(allocation, tightInput);
    const total = out.allocations.reduce((s, a) => s + a.amount, 0);
    expect(total).toBeLessThanOrEqual(30000.5);
  });
});
