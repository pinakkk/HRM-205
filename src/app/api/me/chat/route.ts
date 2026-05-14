import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { env } from "@/lib/env";
import { chat, type ChatMessage } from "@/lib/llm/client";
import { attendancePercent, currentStreak } from "@/lib/streaks";

export const dynamic = "force-dynamic";

const MAX_HISTORY = 12;
const MAX_USER_MESSAGE_LEN = 1000;

type ClientMessage = { role: "user" | "assistant"; content: string };

type ChatResponse = {
  reply: string;
  source: "ai" | "fallback";
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  let body: { messages?: ClientMessage[] };
  try {
    body = (await req.json()) as { messages?: ClientMessage[] };
  } catch {
    return problem(400, "Invalid JSON body");
  }

  const history = sanitizeHistory(body.messages ?? []);
  if (history.length === 0) return problem(400, "messages must include at least one user turn");
  if (history[history.length - 1].role !== "user") {
    return problem(400, "last message must be from the user");
  }

  const context = await loadContext(supabase, user.id);

  if (!env.OPENROUTER_API_KEY) {
    return ok<ChatResponse>({ reply: fallbackReply(context, history[history.length - 1].content), source: "fallback" });
  }

  try {
    const result = await chat(
      [
        { role: "system", content: systemPrompt(context) },
        ...history.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
      ],
      { temperature: 0.5, maxTokens: 500 },
    );
    const reply = result.content.trim();
    if (!reply) return ok<ChatResponse>({ reply: fallbackReply(context, history[history.length - 1].content), source: "fallback" });
    return ok<ChatResponse>({ reply: reply.slice(0, 2000), source: "ai" });
  } catch {
    return ok<ChatResponse>({ reply: fallbackReply(context, history[history.length - 1].content), source: "fallback" });
  }
}

function sanitizeHistory(raw: ClientMessage[]): ClientMessage[] {
  const cleaned: ClientMessage[] = [];
  for (const m of raw) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) continue;
    const content = typeof m.content === "string" ? m.content.trim() : "";
    if (!content) continue;
    cleaned.push({ role: m.role, content: content.slice(0, MAX_USER_MESSAGE_LEN) });
  }
  return cleaned.slice(-MAX_HISTORY);
}

type EmployeeContext = {
  fullName: string;
  email: string;
  role: string;
  department: string | null;
  joinedAt: string;
  tenureMonths: number;
  attendancePct: number;
  streak: number;
  checkedInToday: boolean;
  kpiScore: number;
  weakKpis: string[];
  strongKpis: string[];
  pointsBalance: number;
  lifetimePoints: number;
  pendingLeaves: number;
  approvedLeaves: number;
  remainingLeaveDays: number;
  recentPositive: number;
  recentConstructive: number;
};

async function loadContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<EmployeeContext> {
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [profileRes, attRes, todayAttRes, kpiRes, leavesRes, fbRes, pointsRes] = await Promise.all([
    supabase
      .from("users")
      .select("full_name, email, role, department, joined_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("attendance")
      .select("check_in")
      .eq("user_id", userId)
      .gte("check_in", since),
    supabase
      .from("attendance")
      .select("id")
      .eq("user_id", userId)
      .gte("check_in", todayStart.toISOString())
      .limit(1),
    supabase
      .from("kpi_assignments")
      .select("target, achieved, kpis(title, weight)")
      .eq("user_id", userId),
    supabase
      .from("leaves")
      .select("status, start_date, end_date")
      .eq("user_id", userId),
    supabase
      .from("feedback")
      .select("sentiment")
      .eq("to_user_id", userId)
      .gte("created_at", since),
    supabase
      .from("points_balance")
      .select("balance, lifetime_total")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const checkIns = (attRes.data ?? []).map((r) => r.check_in);
  const kpis = (kpiRes.data ?? []) as unknown as Array<{
    target: number | null;
    achieved: number | null;
    kpis: { title: string; weight: number } | null;
  }>;

  let weight = 0;
  let weighted = 0;
  const weak: string[] = [];
  const strong: string[] = [];
  for (const r of kpis) {
    const t = Number(r.target ?? 0);
    if (t <= 0) continue;
    const a = Number(r.achieved ?? 0);
    const w = Number(r.kpis?.weight ?? 1);
    weight += w;
    const ratio = Math.min(1, a / t);
    weighted += w * ratio;
    const title = r.kpis?.title;
    if (title) {
      if (ratio < 0.6) weak.push(title);
      else if (ratio >= 0.9) strong.push(title);
    }
  }

  const leaves = leavesRes.data ?? [];
  const approvedThisYear = leaves.filter(
    (l) => l.status === "approved" && new Date(l.start_date).getFullYear() === new Date().getFullYear(),
  );
  const usedDays = approvedThisYear.reduce((sum, l) => sum + leaveDays(l.start_date, l.end_date), 0);

  const fb = fbRes.data ?? [];
  const joinedAt = profile?.joined_at ?? new Date().toISOString();
  const tenureMonths = Math.max(
    0,
    Math.round((Date.now() - new Date(joinedAt).getTime()) / (30.4375 * 86400_000)),
  );

  return {
    fullName: profile?.full_name ?? "there",
    email: profile?.email ?? "",
    role: profile?.role ?? "employee",
    department: profile?.department ?? null,
    joinedAt,
    tenureMonths,
    attendancePct: attendancePercent(checkIns, 30),
    streak: currentStreak(checkIns),
    checkedInToday: (todayAttRes.data ?? []).length > 0,
    kpiScore: weight === 0 ? 0 : Math.round((weighted / weight) * 100),
    weakKpis: weak.slice(0, 3),
    strongKpis: strong.slice(0, 3),
    pointsBalance: pointsRes.data?.balance ?? 0,
    lifetimePoints: pointsRes.data?.lifetime_total ?? 0,
    pendingLeaves: leaves.filter((l) => l.status === "pending").length,
    approvedLeaves: approvedThisYear.length,
    remainingLeaveDays: Math.max(0, 12 - usedDays),
    recentPositive: fb.filter((f) => f.sentiment === "positive").length,
    recentConstructive: fb.filter((f) => f.sentiment === "negative" || f.sentiment === "constructive").length,
  };
}

function leaveDays(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return 0;
  return Math.round((e - s) / 86400_000) + 1;
}

function systemPrompt(ctx: EmployeeContext): string {
  return [
    "You are the FairReward HR Assistant — a friendly, concise AI helper embedded in an HR portal.",
    "Personalize every reply using the EMPLOYEE CONTEXT below. Address the employee by first name when natural.",
    "Stay grounded in the provided data; if you don't know something, say so and suggest where to find it in the portal (Attendance, Performance, Bonus, Profile, Leaves).",
    "Keep replies under 120 words unless the user explicitly asks for detail.",
    "Never invent numbers. Never disclose other employees' data. No medical, legal, or compensation guarantees — defer to HR for those.",
    "",
    "FORMATTING RULES (strict — the UI renders Markdown):",
    "- Write in short paragraphs separated by a blank line.",
    "- When listing 2+ items, use a real Markdown bullet list: each item on its own line, starting with `- `. Never inline multiple bullets on one line.",
    "- Use **bold** sparingly to highlight a key value (e.g., **25%**). Do not bold whole sentences.",
    "- Do not use headings (#) or tables. No emojis unless the user uses one first.",
    "- Always put each label/value pair on its own bullet line, e.g.:",
    "  - **Attendance:** 25%",
    "  - **Streak:** 0 days",
    "",
    "EMPLOYEE CONTEXT (JSON):",
    JSON.stringify(ctx),
  ].join("\n");
}

function fallbackReply(ctx: EmployeeContext, lastUser: string): string {
  const firstName = ctx.fullName.split(" ")[0] ?? "there";
  const q = lastUser.toLowerCase();
  if (/attend|check.?in|streak/.test(q)) {
    return `${firstName}, your 30-day attendance is ${ctx.attendancePct}% with a ${ctx.streak}-day streak. ${
      ctx.checkedInToday ? "You're already checked in today." : "You haven't checked in yet today — head to Attendance."
    }`;
  }
  if (/leave|holiday|time.?off|vacation/.test(q)) {
    return `${firstName}, you have ${ctx.remainingLeaveDays} leave days remaining this year. ${
      ctx.pendingLeaves > 0 ? `${ctx.pendingLeaves} request${ctx.pendingLeaves === 1 ? "" : "s"} pending approval.` : "No pending requests."
    } Manage them in Attendance → Leave.`;
  }
  if (/kpi|performance|goal|target/.test(q)) {
    const weak = ctx.weakKpis[0];
    return `${firstName}, your KPI score is ${ctx.kpiScore}%.${weak ? ` Focus on ${weak} to lift it.` : ""} See Performance for details.`;
  }
  if (/point|reward|bonus|wallet|balance/.test(q)) {
    return `${firstName}, you have ${ctx.pointsBalance} points (lifetime ${ctx.lifetimePoints}). Redeem in Bonus.`;
  }
  if (/feedback/.test(q)) {
    return `${firstName}, in the past 30 days you received ${ctx.recentPositive} positive and ${ctx.recentConstructive} constructive notes. Open Performance to review.`;
  }
  return `Hi ${firstName} — I can help with attendance, leaves, KPIs, rewards, or feedback. Try asking "how is my attendance?" or "how many leave days do I have left?"`;
}
