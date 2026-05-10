/**
 * Demo seed for FairReward AI.
 *
 * Creates: 1 admin + 8 employees, 60 days of attendance, KPI assignments,
 * peer feedback, ledger history (points/bonus/kudos), badges, notifications,
 * announcements, leaves, reward rules, and an Employee of the Month.
 *
 * Run with: npm run seed (requires SUPABASE_SERVICE_ROLE_KEY in env).
 *
 * Idempotent for the user accounts (skips existing). Other tables are
 * upserted or guarded so re-running won't duplicate seed rows.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

type DemoUser = {
  email: string;
  full_name: string;
  role: "admin" | "employee";
  department: string | null;
};

const DEMO: DemoUser[] = [
  { email: "admin@fairreward.dev", full_name: "Aanya Rao", role: "admin", department: "HR" },
  { email: "rohan@fairreward.dev", full_name: "Rohan Mehta", role: "employee", department: "Engineering" },
  { email: "isha@fairreward.dev", full_name: "Isha Kapoor", role: "employee", department: "Engineering" },
  { email: "kabir@fairreward.dev", full_name: "Kabir Shah", role: "employee", department: "Engineering" },
  { email: "neil@fairreward.dev", full_name: "Neil Sharma", role: "employee", department: "Sales" },
  { email: "priya@fairreward.dev", full_name: "Priya Iyer", role: "employee", department: "Marketing" },
  { email: "meera@fairreward.dev", full_name: "Meera Singh", role: "employee", department: "Marketing" },
  { email: "arjun@fairreward.dev", full_name: "Arjun Pillai", role: "employee", department: "Finance" },
  { email: "diya@fairreward.dev", full_name: "Diya Banerjee", role: "employee", department: "Sales" },
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isoDay(daysAgo: number, hour = 9, minute = Math.floor(Math.random() * 60)): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function ymd(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function ensureUsers(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const u of DEMO) {
    const { data: existing } = await admin
      .from("users")
      .select("id")
      .eq("email", u.email)
      .maybeSingle();
    if (existing) {
      map.set(u.email, existing.id);
      console.log(`= ${u.email}`);
      continue;
    }
    const { data: created, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: "Password123!",
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });
    if (error || !created.user) {
      console.error(`✗ ${u.email}: ${error?.message}`);
      continue;
    }
    await admin
      .from("users")
      .update({
        full_name: u.full_name,
        role: u.role,
        department: u.department,
        joined_at: ymd(180 + Math.floor(Math.random() * 540)),
        bio: u.role === "admin" ? "HR lead — focused on fairness." : "Excited to be on the team.",
      })
      .eq("id", created.user.id);
    map.set(u.email, created.user.id);
    console.log(`+ ${u.email}`);
  }
  return map;
}

async function seedRewardRules() {
  const rules = [
    { name: "30-day attendance streak", trigger: "attendance_streak_30", points: 200, notes: "Awarded automatically by streak cron." },
    { name: "KPI cycle complete", trigger: "kpi_complete", points: 150, notes: "When achieved/target ratio reaches 100%." },
    { name: "Peer kudos", trigger: "peer_kudos", points: 25, notes: "Per kudos received, capped weekly." },
    { name: "Onboarding finished", trigger: "onboarding_done", points: 100, notes: "Once per employee, on first 30 days complete." },
  ];
  for (const r of rules) {
    const { data: existing } = await admin
      .from("reward_rules")
      .select("id")
      .eq("trigger", r.trigger)
      .maybeSingle();
    if (existing) continue;
    await admin.from("reward_rules").insert(r);
  }
  console.log("· reward_rules seeded");
}

async function seedBadgesAndCatalog() {
  const badges: Array<{ code: string; name: string; description: string; rarity: "bronze" | "silver" | "gold" | "platinum" }> = [
    { code: "first-checkin", name: "First Check-in", description: "Welcome aboard.", rarity: "bronze" },
    { code: "streak-30", name: "30-day Streak", description: "30 consecutive workdays.", rarity: "silver" },
    { code: "kpi-ace", name: "KPI Ace", description: "Hit every KPI in a cycle.", rarity: "gold" },
    { code: "team-mvp", name: "Team MVP", description: "Most kudos received this quarter.", rarity: "gold" },
    { code: "champion", name: "Champion", description: "Top tier on the leaderboard.", rarity: "platinum" },
    { code: "kindness", name: "Kindness Award", description: "Most positive peer feedback.", rarity: "silver" },
  ];
  for (const b of badges) {
    const { data: existing } = await admin.from("badges").select("id").eq("code", b.code).maybeSingle();
    if (existing) continue;
    await admin.from("badges").insert(b);
  }
  const items = [
    { name: "₹500 Amazon voucher", description: "Redeem for an Amazon gift card.", cost_points: 500 },
    { name: "Half-day off", description: "Take a 4-hour break next Friday.", cost_points: 800 },
    { name: "Branded hoodie", description: "FairReward swag.", cost_points: 1200 },
    { name: "Lunch with the CEO", description: "30-minute lunch on us.", cost_points: 2000 },
    { name: "Premium chair upgrade", description: "Ergonomic chair for your desk.", cost_points: 3500 },
  ];
  for (const it of items) {
    const { data: existing } = await admin.from("catalog_items").select("id").eq("name", it.name).maybeSingle();
    if (existing) continue;
    await admin.from("catalog_items").insert({ ...it, active: true });
  }
  console.log("· badges + catalog seeded");
}

async function seedKpis(userIds: string[]) {
  const cycle = `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
  const defs = [
    { title: "Tickets resolved", description: "Customer tickets closed.", weight: 1.0 },
    { title: "Code reviews", description: "PRs reviewed for teammates.", weight: 0.8 },
    { title: "Documentation pages", description: "Pages added to the wiki.", weight: 0.6 },
    { title: "Sales calls", description: "Outbound calls made.", weight: 1.2 },
  ];
  const kpiIds: string[] = [];
  for (const k of defs) {
    const { data: existing } = await admin.from("kpis").select("id").eq("title", k.title).maybeSingle();
    if (existing) {
      kpiIds.push(existing.id);
      continue;
    }
    const { data: inserted } = await admin.from("kpis").insert(k).select("id").single();
    if (inserted) kpiIds.push(inserted.id);
  }
  for (const userId of userIds) {
    for (const kpiId of kpiIds.slice(0, 3)) {
      const target = 50 + Math.floor(Math.random() * 50);
      const achieved = Math.floor(target * (0.4 + Math.random() * 0.7));
      await admin.from("kpi_assignments").upsert(
        { user_id: userId, kpi_id: kpiId, cycle, target, achieved },
        { onConflict: "user_id,kpi_id,cycle" },
      );
    }
  }
  console.log("· KPIs seeded");
}

async function seedAttendance(userIds: string[]) {
  const rows: Array<{ user_id: string; check_in: string; source: string }> = [];
  for (const userId of userIds) {
    const skipChance = 0.1;
    for (let day = 0; day < 60; day++) {
      const d = new Date();
      d.setDate(d.getDate() - day);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      if (Math.random() < skipChance && day > 0) continue;
      const lateBy = Math.random() < 0.15 ? 60 + Math.floor(Math.random() * 90) : Math.floor(Math.random() * 30);
      const hour = 9 + Math.floor(lateBy / 60);
      const minute = lateBy % 60;
      rows.push({ user_id: userId, check_in: isoDay(day, hour, minute), source: Math.random() < 0.2 ? "qr" : "web" });
    }
  }
  // chunk to avoid hitting limits
  for (let i = 0; i < rows.length; i += 500) {
    await admin.from("attendance").insert(rows.slice(i, i + 500));
  }
  console.log(`· attendance seeded (${rows.length} rows)`);
}

async function seedLedger(userIds: string[], adminId: string) {
  const reasons = [
    "Shipped onboarding flow",
    "Closed P1 incident in 30min",
    "Top monthly seller",
    "Customer testimonial",
    "Mentored new hire",
    "Wrote runbook documentation",
    "Hit Q-stretch KPI",
  ];
  const rows: Array<{
    user_id: string;
    kind: "points" | "bonus" | "kudos";
    amount: number;
    reason: string;
    source: "manual" | "auto_rule" | "peer";
    awarded_by: string;
    created_at: string;
  }> = [];
  for (const userId of userIds) {
    const events = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < events; i++) {
      const kind = rand(["points", "points", "points", "kudos", "bonus"]) as "points" | "kudos" | "bonus";
      rows.push({
        user_id: userId,
        kind,
        amount: kind === "bonus" ? 1000 + Math.floor(Math.random() * 4000) : kind === "kudos" ? 25 : 100 + Math.floor(Math.random() * 200),
        reason: rand(reasons),
        source: kind === "kudos" ? "peer" : Math.random() < 0.5 ? "manual" : "auto_rule",
        awarded_by: adminId,
        created_at: isoDay(Math.floor(Math.random() * 50)),
      });
    }
  }
  for (let i = 0; i < rows.length; i += 200) {
    await admin.from("rewards_ledger").insert(rows.slice(i, i + 200));
  }
  // Refresh MV if RPC exists.
  try {
    await admin.rpc("refresh_points_balance");
  } catch {
    /* ignore — function may not exist locally */
  }
  console.log(`· ledger seeded (${rows.length} rows)`);
}

async function seedFeedback(userIds: string[]) {
  const samples = [
    { body: "Crushed the demo prep this week.", sentiment: "positive" },
    { body: "Could be more responsive on PR reviews.", sentiment: "constructive" },
    { body: "Outstanding ownership of the migration.", sentiment: "positive" },
    { body: "Standups feel rushed lately.", sentiment: "constructive" },
    { body: "Great mentorship of the new joiner.", sentiment: "positive" },
    { body: "Documentation could be more thorough.", sentiment: "neutral" },
  ];
  const rows: Array<{ from_user_id: string; to_user_id: string; body: string; sentiment: string; sentiment_score: number; created_at: string }> = [];
  for (let i = 0; i < userIds.length * 2; i++) {
    const from = rand(userIds);
    let to = rand(userIds);
    while (to === from) to = rand(userIds);
    const s = rand(samples);
    rows.push({
      from_user_id: from,
      to_user_id: to,
      body: s.body,
      sentiment: s.sentiment,
      sentiment_score: s.sentiment === "positive" ? 0.7 : s.sentiment === "negative" ? -0.6 : s.sentiment === "constructive" ? -0.2 : 0,
      created_at: isoDay(Math.floor(Math.random() * 30)),
    });
  }
  for (let i = 0; i < rows.length; i += 200) {
    await admin.from("feedback").insert(rows.slice(i, i + 200));
  }
  console.log(`· feedback seeded (${rows.length} rows)`);
}

async function seedAnnouncements(adminId: string) {
  const rows = [
    {
      author_id: adminId,
      title: "Q2 reward cycle kicks off Monday",
      body: "Heads up — the Q2 bonus allocation cycle starts Monday. Submit any pending KPI evidence by Sunday EOD.",
      audience: "all",
      pinned: true,
      published_at: isoDay(2),
    },
    {
      author_id: adminId,
      title: "Welcome to FairReward AI",
      body: "We've launched a new fairness-aware reward system. Explore your dashboard, set up your profile, and check the new badges page.",
      audience: "all",
      pinned: false,
      published_at: isoDay(7),
    },
    {
      author_id: adminId,
      title: "Engineering all-hands moved to Thursday",
      body: "The eng all-hands is now Thursday at 4pm. Calendar updates have been sent.",
      audience: "engineering",
      pinned: false,
      published_at: isoDay(4),
    },
  ];
  for (const r of rows) {
    const { data: existing } = await admin
      .from("announcements")
      .select("id")
      .eq("title", r.title)
      .maybeSingle();
    if (existing) continue;
    await admin.from("announcements").insert(r);
  }
  console.log("· announcements seeded");
}

async function seedNotifications(userIds: string[]) {
  const rows: Array<{ user_id: string; type: string; title: string; body: string; link: string; created_at: string; read_at: string | null }> = [];
  const samples = [
    { type: "reward", title: "You earned 150 points", body: "Closed a P1 incident.", link: "/employee/rewards" },
    { type: "feedback", title: "New feedback received", body: "Great mentorship of the new joiner.", link: "/employee/feedback" },
    { type: "announcement", title: "Q2 cycle kicks off Monday", body: "Submit KPI evidence by Sunday.", link: "/employee/notifications" },
  ];
  for (const userId of userIds) {
    for (let i = 0; i < 4; i++) {
      const s = rand(samples);
      const days = Math.floor(Math.random() * 10);
      rows.push({
        user_id: userId,
        type: s.type,
        title: s.title,
        body: s.body,
        link: s.link,
        created_at: isoDay(days),
        read_at: days > 4 ? isoDay(days - 1) : null,
      });
    }
  }
  for (let i = 0; i < rows.length; i += 200) {
    await admin.from("notifications").insert(rows.slice(i, i + 200));
  }
  console.log(`· notifications seeded (${rows.length} rows)`);
}

async function seedLeaves(userIds: string[]) {
  const rows: Array<{ user_id: string; start_date: string; end_date: string; type: string; reason: string; status: string }> = [];
  for (const userId of userIds.slice(0, 5)) {
    const startDays = 5 + Math.floor(Math.random() * 25);
    const length = Math.floor(Math.random() * 3) + 1;
    rows.push({
      user_id: userId,
      start_date: ymd(startDays),
      end_date: ymd(startDays - length + 1),
      type: rand(["casual", "sick", "earned"]),
      reason: rand(["Personal trip", "Family function", "Doctor appointment", "Wellness day"]),
      status: rand(["pending", "approved", "rejected"]),
    });
  }
  // ensure at least one pending
  if (!rows.some((r) => r.status === "pending") && rows.length > 0) rows[0].status = "pending";
  for (const r of rows) await admin.from("leaves").insert(r);
  console.log(`· leaves seeded (${rows.length} rows)`);
}

async function seedEotm(userIds: string[], adminId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastMonth = month === 1 ? 12 : month - 1;
  const lastYear = month === 1 ? year - 1 : year;
  const winner = userIds[0];
  await admin.from("employee_of_month").upsert(
    {
      year: lastYear,
      month: lastMonth,
      user_id: winner,
      reason: "Outstanding ownership across two flagship launches.",
      selected_by: adminId,
    },
    { onConflict: "year,month" },
  );
  console.log("· employee_of_month seeded (last month)");
}

async function seedUserBadges(userIds: string[]) {
  const { data: badges } = await admin.from("badges").select("id, code");
  const map = new Map((badges ?? []).map((b) => [b.code, b.id]));
  const firstId = map.get("first-checkin");
  if (!firstId) return;
  for (const userId of userIds) {
    await admin
      .from("user_badges")
      .upsert({ user_id: userId, badge_id: firstId }, { onConflict: "user_id,badge_id" });
  }
  // give the top employee the streak + KPI badges
  if (userIds[0]) {
    const streak = map.get("streak-30");
    const ace = map.get("kpi-ace");
    if (streak) await admin.from("user_badges").upsert({ user_id: userIds[0], badge_id: streak }, { onConflict: "user_id,badge_id" });
    if (ace) await admin.from("user_badges").upsert({ user_id: userIds[0], badge_id: ace }, { onConflict: "user_id,badge_id" });
  }
  console.log("· user_badges seeded");
}

async function main() {
  const ids = await ensureUsers();
  const adminId = ids.get("admin@fairreward.dev");
  const employeeIds = DEMO.filter((d) => d.role === "employee")
    .map((d) => ids.get(d.email))
    .filter((x): x is string => Boolean(x));

  if (!adminId) {
    console.error("Admin user missing — aborting further seeding.");
    return;
  }

  await seedRewardRules();
  await seedBadgesAndCatalog();
  await seedKpis(employeeIds);
  await seedAttendance(employeeIds);
  await seedLedger(employeeIds, adminId);
  await seedFeedback(employeeIds);
  await seedAnnouncements(adminId);
  await seedNotifications(employeeIds);
  await seedLeaves(employeeIds);
  await seedEotm(employeeIds, adminId);
  await seedUserBadges(employeeIds);

  console.log("\nDone. Sign in with admin@fairreward.dev / Password123!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
