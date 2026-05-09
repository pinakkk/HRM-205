/**
 * Local dev seed: 1 admin + a handful of demo employees.
 * Run with: pnpm seed (requires SUPABASE_SERVICE_ROLE_KEY in env).
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const DEMO = [
  { email: "admin@fairreward.dev",   full_name: "Aanya Rao",     role: "admin",    department: "HR" },
  { email: "rohan@fairreward.dev",   full_name: "Rohan Mehta",   role: "employee", department: "Engineering" },
  { email: "isha@fairreward.dev",    full_name: "Isha Kapoor",   role: "employee", department: "Engineering" },
  { email: "neil@fairreward.dev",    full_name: "Neil Sharma",   role: "employee", department: "Sales" },
  { email: "priya@fairreward.dev",   full_name: "Priya Iyer",    role: "employee", department: "Marketing" },
  { email: "kabir@fairreward.dev",   full_name: "Kabir Shah",    role: "employee", department: "Engineering" },
];

async function main() {
  for (const u of DEMO) {
    const { data: existing } = await admin
      .from("users")
      .select("id")
      .eq("email", u.email)
      .maybeSingle();
    if (existing) {
      console.log(`= ${u.email} already exists`);
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
        role: u.role as "admin" | "employee",
        department: u.department,
      })
      .eq("id", created.user.id);

    console.log(`+ ${u.email}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
