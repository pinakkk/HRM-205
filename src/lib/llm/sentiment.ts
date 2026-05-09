import { env } from "@/lib/env";
import { chat } from "@/lib/llm/client";
import { SENTIMENT_SYSTEM } from "@/lib/llm/prompts";
import { sentimentSchema, type Sentiment } from "@/lib/llm/schemas";

export async function classifySentiment(body: string): Promise<Sentiment | null> {
  try {
    const { content } = await chat(
      [
        { role: "system", content: SENTIMENT_SYSTEM },
        { role: "user", content: body },
      ],
      {
        model: env.OPENROUTER_DEFAULT_MODEL,
        responseFormat: "json",
        temperature: 0,
        maxTokens: 80,
      },
    );
    const parsed = sentimentSchema.safeParse(JSON.parse(content));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
