import { env } from "@/lib/env";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
  /** If set, OpenRouter will return JSON conforming to this schema. */
  jsonSchema?: { name: string; schema: unknown };
};

export type ChatResult = {
  content: string;
  model: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
};

/**
 * Thin OpenRouter wrapper. Retries 5xx with exponential backoff.
 * Returns raw content; callers parse + Zod-validate.
 */
export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<ChatResult> {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured.");
  }

  const body: Record<string, unknown> = {
    model: opts.model ?? env.OPENROUTER_DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.2,
    max_tokens: opts.maxTokens ?? 1500,
  };

  if (opts.jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: opts.jsonSchema.name, strict: true, schema: opts.jsonSchema.schema },
    };
  } else if (opts.responseFormat === "json") {
    body.response_format = { type: "json_object" };
  }

  const maxAttempts = 3;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://fairreward.app",
          "X-Title": "FairReward AI",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status >= 500 && attempt < maxAttempts) {
          await sleep(250 * 2 ** (attempt - 1));
          continue;
        }
        const text = await res.text();
        throw new Error(`OpenRouter ${res.status}: ${text}`);
      }

      const json = (await res.json()) as {
        choices: { message: { content: string } }[];
        model: string;
        usage?: ChatResult["usage"];
      };

      return {
        content: json.choices[0]?.message?.content ?? "",
        model: json.model,
        usage: json.usage,
      };
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts) break;
      await sleep(250 * 2 ** (attempt - 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("LLM call failed.");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
