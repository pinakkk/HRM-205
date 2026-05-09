// Supabase Edge Function — fired by a database webhook on `public.feedback` insert.
// Calls OpenRouter to classify sentiment, then writes back to the row.
//
// Deploy:
//   supabase functions deploy on-feedback-insert --no-verify-jwt
// Webhook target:
//   https://<project>.functions.supabase.co/on-feedback-insert

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — runs in Deno, not Node.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = Deno.env.get("OPENROUTER_DEFAULT_MODEL") ?? "openai/gpt-4o-mini";

const SYSTEM_PROMPT = `You are a feedback sentiment classifier.
Return strict JSON: { "sentiment": "positive"|"neutral"|"constructive"|"negative", "score": number in [-1,1] }.`;

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const row = payload.record;
    if (!row?.id || !row?.body) {
      return new Response("bad payload", { status: 400 });
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) return new Response("no api key", { status: 200 });

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        max_tokens: 80,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: row.body },
        ],
      }),
    });
    if (!res.ok) return new Response(await res.text(), { status: 500 });

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase
      .from("feedback")
      .update({
        sentiment: parsed.sentiment ?? null,
        sentiment_score: parsed.score ?? null,
      })
      .eq("id", row.id);

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    return new Response(err?.message ?? "error", { status: 500 });
  }
});
