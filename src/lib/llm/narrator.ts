import { env } from "@/lib/env";
import { chat } from "@/lib/llm/client";
import { BIAS_NARRATOR_SYSTEM } from "@/lib/llm/prompts";
import { biasNarrationSchema, type BiasNarration } from "@/lib/llm/schemas";

export type BiasStats = {
  disparate_impact: { gender: unknown[]; department: unknown[] };
  department_anova: { f: number | null; pApprox: string | null; flagged: boolean };
  manager_skew: unknown[];
  counts: { rows: number };
};

export async function proposeBiasNarration(stats: BiasStats): Promise<BiasNarration | null> {
  try {
    const { content } = await chat(
      [
        { role: "system", content: BIAS_NARRATOR_SYSTEM },
        { role: "user", content: JSON.stringify(stats) },
      ],
      {
        model: env.OPENROUTER_NARRATOR_MODEL,
        responseFormat: "json",
        temperature: 0.2,
        maxTokens: 800,
      },
    );
    const parsed = biasNarrationSchema.safeParse(JSON.parse(content));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
