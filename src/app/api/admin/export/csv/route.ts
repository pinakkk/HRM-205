import { createClient } from "@/lib/supabase/server";
import { problem } from "@/lib/http";

const ALLOWED = new Set(["ledger", "users", "redemptions"]);

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return problem(401, "Unauthenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return problem(403, "Admin only");

  const url = new URL(request.url);
  const dataset = url.searchParams.get("dataset") ?? "ledger";
  if (!ALLOWED.has(dataset)) return problem(400, "Unknown dataset");

  let rows: Record<string, unknown>[] = [];
  if (dataset === "ledger") {
    const { data } = await supabase
      .from("rewards_ledger")
      .select("id, user_id, cycle_id, kind, amount, reason, source, created_at")
      .order("created_at", { ascending: false });
    rows = data ?? [];
  } else if (dataset === "users") {
    const { data } = await supabase
      .from("users")
      .select("id, email, full_name, role, department, joined_at");
    rows = data ?? [];
  } else if (dataset === "redemptions") {
    const { data } = await supabase
      .from("redemptions")
      .select("id, user_id, item_id, points_spent, status, created_at");
    rows = data ?? [];
  }

  const csv = toCsv(rows);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${dataset}.csv"`,
    },
  });
}

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((h) => escape(row[h])).join(","));
  return lines.join("\n");
}
