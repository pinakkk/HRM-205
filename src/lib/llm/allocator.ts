import { env } from "@/lib/env";
import { chat } from "@/lib/llm/client";
import { ALLOCATOR_SYSTEM } from "@/lib/llm/prompts";
import {
  allocationSchema,
  type Allocation,
  type AllocatorInput,
} from "@/lib/llm/schemas";

const FORBIDDEN_TOKENS = [
  /\bgender\b/i,
  /\brace\b/i,
  /\bage\b/i,
  /\breligion\b/i,
  /\bethnic/i,
  /\bcaste\b/i,
];

/**
 * Calls the LLM, parses JSON, Zod-validates, server-clamps to constraints.
 * Falls back to equal split on hard failure.
 */
export async function proposeAllocation(input: AllocatorInput): Promise<Allocation> {
  let raw = "";
  try {
    const res = await chat(
      [
        { role: "system", content: ALLOCATOR_SYSTEM },
        { role: "user", content: JSON.stringify(input) },
      ],
      {
        model: env.OPENROUTER_ALLOCATOR_MODEL,
        responseFormat: "json",
        temperature: 0.1,
        maxTokens: 2000,
      },
    );
    raw = res.content;
  } catch {
    return equalSplit(input);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return equalSplit(input);
  }

  const validation = allocationSchema.safeParse(parsed);
  if (!validation.success) return equalSplit(input);

  return clamp(validation.data, input);
}

/**
 * Server-side guardrails — re-applied even if the LLM "respected" them.
 */
export function clamp(allocation: Allocation, input: AllocatorInput): Allocation {
  const cap = input.pool_amount * 0.25;
  const validUserIds = new Set(input.employees.map((e) => e.user_id));

  const cleaned = allocation.allocations
    .filter((a) => validUserIds.has(a.user_id))
    .map((a) => ({
      ...a,
      amount: Math.max(0, Math.min(a.amount, cap)),
      rationale: scrubRationale(a.rationale),
    }));

  // Scale down proportionally if total > pool_amount
  const total = cleaned.reduce((s, a) => s + a.amount, 0);
  if (total > input.pool_amount && total > 0) {
    const scale = input.pool_amount / total;
    cleaned.forEach((a) => {
      a.amount = Math.round(a.amount * scale * 100) / 100;
    });
  }

  const finalTotal = cleaned.reduce((s, a) => s + a.amount, 0);

  return {
    cycle_label: input.cycle_label,
    total_pool: input.pool_amount,
    allocations: cleaned,
    pool_residual: Math.round((input.pool_amount - finalTotal) * 100) / 100,
  };
}

function scrubRationale(text: string): string {
  let cleaned = text;
  for (const re of FORBIDDEN_TOKENS) cleaned = cleaned.replace(re, "[redacted]");
  return cleaned.slice(0, 280);
}

/**
 * Deterministic fallback — equal split, with KPI-weighted distribution if available.
 */
export function equalSplit(input: AllocatorInput): Allocation {
  const totalKpi = input.employees.reduce((s, e) => s + Math.max(e.kpi_score, 1), 0);
  const allocations = input.employees.map((e) => {
    const share = Math.max(e.kpi_score, 1) / totalKpi;
    const amount = Math.round(input.pool_amount * share * 100) / 100;
    return {
      user_id: e.user_id,
      amount,
      rationale: `Fallback allocation: KPI-weighted share (kpi_score=${e.kpi_score}).`,
      confidence: 0.4,
    };
  });
  const total = allocations.reduce((s, a) => s + a.amount, 0);
  return {
    cycle_label: input.cycle_label,
    total_pool: input.pool_amount,
    allocations,
    pool_residual: Math.round((input.pool_amount - total) * 100) / 100,
  };
}
