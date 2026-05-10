import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];

export async function notify(input: NotificationInsert) {
  const supabase = createAdminClient();
  await supabase.from("notifications").insert(input);
}

export async function notifyMany(rows: NotificationInsert[]) {
  if (rows.length === 0) return;
  const supabase = createAdminClient();
  await supabase.from("notifications").insert(rows);
}
