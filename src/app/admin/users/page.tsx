import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, full_name, email, role, department, joined_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50">
          Import CSV
        </button>
      </div>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Dept</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map((u) => {
              const roleLabel = u.role === "admin"
                ? "HR"
                : u.role
                ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
                : "";

              return (
                <tr key={u.id}>
                  <td className="p-3">{u.full_name}</td>
                  <td className="p-3 text-neutral-500">{u.email}</td>
                  <td className="p-3">{roleLabel}</td>
                  <td className="p-3">{u.department ?? "—"}</td>
                  <td className="p-3 text-neutral-500">{u.joined_at}</td>
                </tr>
              );
            }) ?? null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
