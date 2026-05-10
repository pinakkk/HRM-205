import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NotificationsList } from "./list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const me = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .eq("user_id", me.profile.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-neutral-500">Recent rewards, feedback, and announcements.</p>
        </div>
      </div>
      <NotificationsList initial={data ?? []} />
    </div>
  );
}
