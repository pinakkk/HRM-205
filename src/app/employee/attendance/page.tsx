import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CheckInButton } from "./check-in-button";

export default async function AttendancePage() {
  const me = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("id, check_in, check_out")
    .eq("user_id", me.profile.id)
    .order("check_in", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>
      <CheckInButton />

      <section>
        <h2 className="mb-2 text-lg font-semibold">Recent check-ins</h2>
        <div className="rounded-md border">
          {data?.length ? (
            <ul className="divide-y">
              {data.map((row) => (
                <li key={row.id} className="flex items-center justify-between p-3 text-sm">
                  <span>{new Date(row.check_in).toLocaleString()}</span>
                  <span className="text-neutral-500">
                    {row.check_out ? "✓ checked out" : "in progress"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-neutral-500">No check-ins yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
