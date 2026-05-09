import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/nav/Sidebar";
import { TopBar } from "@/components/nav/TopBar";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/kpis", label: "KPIs" },
  { href: "/admin/allocator", label: "AI Allocator" },
  { href: "/admin/audit", label: "Bias Audit" },
  { href: "/admin/redemptions", label: "Redemptions" },
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar profile={me.profile} />
      <div className="flex flex-1">
        <Sidebar title="HR Admin" items={items} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
