import { z } from "zod";

// ─── L1 — Sentiment ──────────────────────────────────────
export const sentimentSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "constructive", "negative"]),
  score: z.number().min(-1).max(1),
});
export type Sentiment = z.infer<typeof sentimentSchema>;

// ─── L2 — Bonus Allocator ────────────────────────────────
export const allocationItemSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().min(0),
  rationale: z.string().max(280),
  confidence: z.number().min(0).max(1),
});

export const allocationSchema = z.object({
  cycle_label: z.string(),
  total_pool: z.number().nonnegative(),
  allocations: z.array(allocationItemSchema),
  pool_residual: z.number(),
});
export type Allocation = z.infer<typeof allocationSchema>;
export type AllocationItem = z.infer<typeof allocationItemSchema>;

export const allocatorInputSchema = z.object({
  cycle_label: z.string().min(1),
  pool_amount: z.number().positive(),
  employees: z
    .array(
      z.object({
        user_id: z.string().uuid(),
        full_name: z.string(),
        attendance_pct: z.number().min(0).max(100),
        kpi_score: z.number().min(0).max(100),
        peer_sentiment: z.number().min(-1).max(1),
        tenure_months: z.number().nonnegative(),
      }),
    )
    .min(1),
});
export type AllocatorInput = z.infer<typeof allocatorInputSchema>;

// ─── L3 — Bias Narrator ──────────────────────────────────
export const biasNarrationSchema = z.object({
  headline: z.string().max(160),
  paragraphs: z.array(z.string()).min(1).max(4),
  recommendations: z.array(z.string()).max(5),
});
export type BiasNarration = z.infer<typeof biasNarrationSchema>;
