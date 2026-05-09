import { Resend } from "resend";
import { ok } from "@/lib/http";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!env.RESEND_API_KEY) {
    return ok({ status: "skipped", reason: "RESEND_API_KEY not set" });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return ok({ status: "skipped", reason: "service-role missing" });
  }

  const sinceIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: ledger } = await admin
    .from("rewards_ledger")
    .select("user_id, kind, amount, reason, created_at")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false });

  const byUser = new Map<string, { points: number; bonus: number; lines: string[] }>();
  for (const r of ledger ?? []) {
    const e = byUser.get(r.user_id) ?? { points: 0, bonus: 0, lines: [] };
    if (r.kind === "bonus") e.bonus += Number(r.amount);
    else e.points += Number(r.amount);
    e.lines.push(`• ${r.kind} ${r.amount} — ${r.reason}`);
    byUser.set(r.user_id, e);
  }

  if (byUser.size === 0) {
    return ok({ status: "noop", reason: "no ledger activity" });
  }

  const userIds = Array.from(byUser.keys());
  const { data: profiles } = await admin
    .from("users")
    .select("id, email, full_name")
    .in("id", userIds);

  const resend = new Resend(env.RESEND_API_KEY);
  let sent = 0;
  let failed = 0;

  for (const p of profiles ?? []) {
    const e = byUser.get(p.id);
    if (!e) continue;
    const html = renderDigest(p.full_name, e);
    try {
      await resend.emails.send({
        from: "FairReward AI <noreply@fairreward.app>",
        to: p.email,
        subject: "Your weekly FairReward digest",
        html,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return ok({ status: "ok", sent, failed, users: byUser.size });
}

function renderDigest(
  name: string,
  e: { points: number; bonus: number; lines: string[] },
): string {
  const lines = e.lines
    .slice(0, 10)
    .map((l) => `<li style="margin: 4px 0;">${escape(l)}</li>`)
    .join("");
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 8px;">Hi ${escape(name)},</h2>
      <p style="margin: 0 0 16px; color: #555;">Here's your activity from the past 7 days.</p>
      <div style="display: flex; gap: 16px; margin: 16px 0;">
        <div style="flex: 1; padding: 12px; border: 1px solid #eee; border-radius: 8px;">
          <div style="font-size: 12px; text-transform: uppercase; color: #888;">Points</div>
          <div style="font-size: 24px; font-weight: 700;">${formatINR(e.points, false)}</div>
        </div>
        <div style="flex: 1; padding: 12px; border: 1px solid #eee; border-radius: 8px;">
          <div style="font-size: 12px; text-transform: uppercase; color: #888;">Bonus</div>
          <div style="font-size: 24px; font-weight: 700;">${formatINR(e.bonus, true)}</div>
        </div>
      </div>
      <ul style="padding-left: 20px; color: #333;">${lines}</ul>
      <p style="margin-top: 24px; font-size: 12px; color: #888;">FairReward AI — view your full ledger in the app.</p>
    </div>
  `;
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function formatINR(n: number, currency: boolean) {
  return new Intl.NumberFormat("en-IN", {
    style: currency ? "currency" : "decimal",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
