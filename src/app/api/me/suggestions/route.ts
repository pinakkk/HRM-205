import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { env } from "@/lib/env";
import { chat } from "@/lib/llm/client";
import { attendancePercent, currentStreak } from "@/lib/streaks";

type Suggestion = { headline: string; tips: string[]; source: "ai" | "fallback" };

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const since = new Date(Date.now() - 30 * 86400_000).toISOString();

  const [{ data: kpis }, { data: att }, { data: fb }] = await Promise.all([
    supabase
      .from("kpi_assignments")
      .select("target, achieved, kpis(title, weight)")
      .eq("user_id", user.id),
    supabase
      .from("attendance")
      .select("check_in")
      .eq("user_id", user.id)
      .gte("check_in", since),
    supabase
      .from("feedback")
      .select("sentiment, body")
      .eq("to_user_id", user.id)
      .gte("created_at", since),
  ]);

  const features = summarise({
    kpis: (kpis ?? []) as unknown as Array<{ target: number | null; achieved: number | null; kpis: { title: string; weight: number } | null }>,
    checkIns: (att ?? []).map((a) => a.check_in),
    feedback: (fb ?? []) as unknown as Array<{ sentiment: string | null; body: string }>,
  });

  const result = (await tryLLM(features)) ?? fallback(features);
  return ok<Suggestion>(result);
}

type Features = {
  kpiScore: number;
  weakKpis: string[];
  attendancePct: number;
  streak: number;
  recentNegative: number;
  recentPositive: number;
};

function summarise(input: {
  kpis: Array<{ target: number | null; achieved: number | null; kpis: { title: string; weight: number } | null }>;
  checkIns: string[];
  feedback: Array<{ sentiment: string | null }>;
}): Features {
  let weight = 0;
  let weighted = 0;
  const weakKpis: string[] = [];
  for (const r of input.kpis) {
    const t = Number(r.target ?? 0);
    const a = Number(r.achieved ?? 0);
    if (t <= 0) continue;
    const w = Number(r.kpis?.weight ?? 1);
    weight += w;
    const ratio = Math.min(1, a / t);
    weighted += w * ratio;
    if (ratio < 0.6 && r.kpis?.title) weakKpis.push(r.kpis.title);
  }
  return {
    kpiScore: weight === 0 ? 0 : Math.round((weighted / weight) * 100),
    weakKpis: weakKpis.slice(0, 3),
    attendancePct: attendancePercent(input.checkIns, 30),
    streak: currentStreak(input.checkIns),
    recentNegative: input.feedback.filter((f) => f.sentiment === "negative" || f.sentiment === "constructive").length,
    recentPositive: input.feedback.filter((f) => f.sentiment === "positive").length,
  };
}

function fallback(f: Features): Suggestion {
  const tips: string[] = [];
  if (f.kpiScore < 60) {
    tips.push(`Your overall KPI score is ${f.kpiScore}%. Focus on closing the gap on ${f.weakKpis[0] ?? "your weakest KPI"} first.`);
  } else if (f.kpiScore < 80) {
    tips.push(`KPI score at ${f.kpiScore}% — pick one stretch goal this cycle to push past 80%.`);
  } else {
    tips.push(`Strong KPI score (${f.kpiScore}%). Mentor a teammate on a metric you're excelling at.`);
  }
  if (f.attendancePct < 80) {
    tips.push(`Attendance over the past 30 days is ${f.attendancePct}%. Restore consistency — streak rewards unlock at 30 days.`);
  } else if (f.streak >= 20) {
    tips.push(`Strong attendance streak (${f.streak} days). Keep it going — the next badge unlocks at 30.`);
  }
  if (f.recentNegative >= 2) {
    tips.push(`Recent feedback included ${f.recentNegative} constructive notes — review them and pick one concrete change.`);
  } else if (f.recentPositive >= 2) {
    tips.push(`Recent feedback skewed positive — share a 2-line "what's working" note in your team channel.`);
  }
  if (tips.length === 0) tips.push("Things look balanced. Pick one stretch KPI for the cycle and aim to over-deliver by 10%.");

  const headline =
    f.kpiScore >= 80
      ? "On track — keep momentum"
      : f.kpiScore >= 60
        ? "Steady — small wins ahead"
        : "Room to grow this cycle";
  return { headline, tips: tips.slice(0, 4), source: "fallback" };
}

async function tryLLM(f: Features): Promise<Suggestion | null> {
  if (!env.OPENROUTER_API_KEY) return null;
  try {
    const result = await chat(
      [
        {
          role: "system",
          content:
            "You are a supportive performance coach. Given an employee's last-30-day metrics, return JSON {headline:string, tips:string[]} with at most 4 tips, each <=180 characters, actionable, and grounded only in the input. No demographics. Avoid fluff.",
        },
        { role: "user", content: JSON.stringify(f) },
      ],
      { responseFormat: "json", maxTokens: 600, temperature: 0.4 },
    );
    const parsed = JSON.parse(result.content) as { headline?: string; tips?: string[] };
    if (!parsed.headline || !Array.isArray(parsed.tips) || parsed.tips.length === 0) return null;
    return {
      headline: String(parsed.headline).slice(0, 120),
      tips: parsed.tips.map((t) => String(t).slice(0, 280)).slice(0, 4),
      source: "ai",
    };
  } catch {
    return null;
  }
}
